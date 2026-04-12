import {HttpStatus} from '@nestjs/common';
import {createHmac} from 'node:crypto';
import http from 'node:http';
import {afterEach, describe, expect, it} from 'vitest';

import {WebhookForwarder} from './WebhookForwarder.js';

import 'reflect-metadata';

function closeServer(server: http.Server): Promise<void> {
  return new Promise(resolve => {
    server.close(() => resolve());
  });
}

function createTargetServer(
  handler: (req: http.IncomingMessage, res: http.ServerResponse) => void
): Promise<{port: number; server: http.Server}> {
  return new Promise(resolve => {
    const server = http.createServer(handler);
    server.listen(0, '127.0.0.1', () => {
      const address = server.address();
      if (address && typeof address === 'object') {
        resolve({port: address.port, server});
      }
    });
  });
}

function getAppPort(forwarder: WebhookForwarder): number {
  const app = (forwarder as any).app;
  const server = app.getHttpServer();
  return server.address().port;
}

function sendRequest(
  port: number,
  options: {body?: string; headers?: Record<string, string>; method?: string; path?: string} = {}
): Promise<{body: string; statusCode: number}> {
  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        headers: options.headers,
        hostname: '127.0.0.1',
        method: options.method || 'POST',
        path: options.path || '/',
        port,
      },
      res => {
        const chunks: Buffer[] = [];
        res.on('data', (chunk: Buffer) => chunks.push(chunk));
        res.on('end', () => {
          resolve({
            body: Buffer.concat(chunks).toString(),
            statusCode: res.statusCode || 0,
          });
        });
      }
    );
    req.on('error', reject);
    if (options.body) {
      req.write(options.body);
    }
    req.end();
  });
}

describe('WebhookForwarder', () => {
  let forwarder: WebhookForwarder;
  let targetServer: http.Server;

  afterEach(async () => {
    await forwarder?.stop();
    if (targetServer) {
      await closeServer(targetServer);
    }
  });

  it('forwards a POST request to the target URL', async () => {
    let receivedBody = '';
    let receivedMethod = '';

    const target = await createTargetServer((req, res) => {
      receivedMethod = req.method || '';
      const chunks: Buffer[] = [];
      req.on('data', (chunk: Buffer) => chunks.push(chunk));
      req.on('end', () => {
        receivedBody = Buffer.concat(chunks).toString();
        res.writeHead(HttpStatus.OK, {'Content-Type': 'application/json'});
        res.end(JSON.stringify({ok: true}));
      });
    });

    targetServer = target.server;

    forwarder = new WebhookForwarder({
      configFile: false,
      host: '127.0.0.1',
      port: 0,
      routes: [{path: '/', target: `http://127.0.0.1:${target.port}`}],
    });

    await forwarder.start();
    const port = getAppPort(forwarder);

    const response = await sendRequest(port, {body: '{"event":"push"}'});

    expect(response.statusCode).toBe(HttpStatus.OK);
    expect(response.body).toBe('{"ok":true}');
    expect(receivedMethod).toBe('POST');
    expect(receivedBody).toBe('{"event":"push"}');
  });

  it('forwards headers from the original request', async () => {
    let receivedHeaders: http.IncomingHttpHeaders = {};

    const target = await createTargetServer((req, res) => {
      receivedHeaders = req.headers;
      res.writeHead(HttpStatus.OK);
      res.end('ok');
    });

    targetServer = target.server;

    forwarder = new WebhookForwarder({
      configFile: false,
      host: '127.0.0.1',
      port: 0,
      routes: [{path: '/', target: `http://127.0.0.1:${target.port}`}],
    });

    await forwarder.start();
    const port = getAppPort(forwarder);

    await sendRequest(port, {
      body: '{}',
      headers: {'content-type': 'application/json', 'x-custom-header': 'test-value'},
    });

    expect(receivedHeaders['content-type']).toBe('application/json');
    expect(receivedHeaders['x-custom-header']).toBe('test-value');
  });

  it('returns 404 for non-matching paths', async () => {
    const target = await createTargetServer((_req, res) => {
      res.writeHead(HttpStatus.OK);
      res.end('ok');
    });

    targetServer = target.server;

    forwarder = new WebhookForwarder({
      configFile: false,
      host: '127.0.0.1',
      port: 0,
      routes: [{path: '/webhook', target: `http://127.0.0.1:${target.port}`}],
    });

    await forwarder.start();
    const port = getAppPort(forwarder);

    const response = await sendRequest(port, {path: '/other'});
    expect(response.statusCode).toBe(HttpStatus.NOT_FOUND);
  });

  it('returns 502 when target is unreachable', async () => {
    forwarder = new WebhookForwarder({
      configFile: false,
      host: '127.0.0.1',
      port: 0,
      routes: [{path: '/', target: 'http://127.0.0.1:1'}],
    });

    await forwarder.start();
    const port = getAppPort(forwarder);

    const response = await sendRequest(port, {body: 'test'});
    expect(response.statusCode).toBe(HttpStatus.BAD_GATEWAY);
  });

  it('routes different paths to different targets', async () => {
    let target1Received = '';
    let target2Received = '';

    const target1 = await createTargetServer((req, res) => {
      const chunks: Buffer[] = [];
      req.on('data', (chunk: Buffer) => chunks.push(chunk));
      req.on('end', () => {
        target1Received = Buffer.concat(chunks).toString();
        res.writeHead(HttpStatus.OK, {'Content-Type': 'text/plain'});
        res.end('target1');
      });
    });

    const target2 = await createTargetServer((req, res) => {
      const chunks: Buffer[] = [];
      req.on('data', (chunk: Buffer) => chunks.push(chunk));
      req.on('end', () => {
        target2Received = Buffer.concat(chunks).toString();
        res.writeHead(HttpStatus.OK, {'Content-Type': 'text/plain'});
        res.end('target2');
      });
    });

    targetServer = target1.server;
    const targetServer2 = target2.server;

    forwarder = new WebhookForwarder({
      configFile: false,
      host: '127.0.0.1',
      port: 0,
      routes: [
        {path: '/hook1', target: `http://127.0.0.1:${target1.port}`},
        {path: '/hook2', target: `http://127.0.0.1:${target2.port}`},
      ],
    });

    await forwarder.start();
    const port = getAppPort(forwarder);

    const res1 = await sendRequest(port, {body: 'payload1', path: '/hook1'});
    const res2 = await sendRequest(port, {body: 'payload2', path: '/hook2'});

    expect(res1.body).toBe('target1');
    expect(res2.body).toBe('target2');
    expect(target1Received).toBe('payload1');
    expect(target2Received).toBe('payload2');

    await closeServer(targetServer2);
  });

  it('throws when no routes are configured', async () => {
    forwarder = new WebhookForwarder({
      configFile: false,
      host: '127.0.0.1',
      port: 0,
    });

    await expect(forwarder.start()).rejects.toThrow('No routes configured');
  });

  it('accepts requests with a valid X-Hub-Signature-256', async () => {
    const secret = 'test-webhook-secret';
    const payload = '{"action":"opened"}';
    const signature = `sha256=${createHmac('sha256', secret).update(payload).digest('hex')}`;

    const target = await createTargetServer((_req, res) => {
      res.writeHead(HttpStatus.OK, {'Content-Type': 'application/json'});
      res.end(JSON.stringify({ok: true}));
    });

    targetServer = target.server;

    forwarder = new WebhookForwarder({
      configFile: false,
      host: '127.0.0.1',
      port: 0,
      routes: [{path: '/', secret, target: `http://127.0.0.1:${target.port}`}],
    });

    await forwarder.start();
    const port = getAppPort(forwarder);

    const response = await sendRequest(port, {
      body: payload,
      headers: {'content-type': 'application/json', 'x-hub-signature-256': signature},
    });

    expect(response.statusCode).toBe(HttpStatus.OK);
    expect(response.body).toBe('{"ok":true}');
  });

  it('rejects requests with an invalid X-Hub-Signature-256', async () => {
    const secret = 'test-webhook-secret';
    const payload = '{"action":"opened"}';

    const target = await createTargetServer((_req, res) => {
      res.writeHead(HttpStatus.OK);
      res.end('ok');
    });

    targetServer = target.server;

    forwarder = new WebhookForwarder({
      configFile: false,
      host: '127.0.0.1',
      port: 0,
      routes: [{path: '/', secret, target: `http://127.0.0.1:${target.port}`}],
    });

    await forwarder.start();
    const port = getAppPort(forwarder);

    const response = await sendRequest(port, {
      body: payload,
      headers: {'content-type': 'application/json', 'x-hub-signature-256': 'sha256=invalid'},
    });

    expect(response.statusCode).toBe(HttpStatus.UNAUTHORIZED);
  });

  it('rejects requests with a missing X-Hub-Signature-256 when secret is configured', async () => {
    const secret = 'test-webhook-secret';

    const target = await createTargetServer((_req, res) => {
      res.writeHead(HttpStatus.OK);
      res.end('ok');
    });

    targetServer = target.server;

    forwarder = new WebhookForwarder({
      configFile: false,
      host: '127.0.0.1',
      port: 0,
      routes: [{path: '/', secret, target: `http://127.0.0.1:${target.port}`}],
    });

    await forwarder.start();
    const port = getAppPort(forwarder);

    const response = await sendRequest(port, {
      body: '{"action":"opened"}',
      headers: {'content-type': 'application/json'},
    });

    expect(response.statusCode).toBe(HttpStatus.UNAUTHORIZED);
  });

  it('forwards GitHub-specific headers to the target', async () => {
    let receivedHeaders: http.IncomingHttpHeaders = {};

    const target = await createTargetServer((req, res) => {
      receivedHeaders = req.headers;
      res.writeHead(HttpStatus.OK);
      res.end('ok');
    });

    targetServer = target.server;

    forwarder = new WebhookForwarder({
      configFile: false,
      host: '127.0.0.1',
      port: 0,
      routes: [{path: '/', target: `http://127.0.0.1:${target.port}`}],
    });

    await forwarder.start();
    const port = getAppPort(forwarder);

    await sendRequest(port, {
      body: '{}',
      headers: {
        'content-type': 'application/json',
        'x-github-delivery': '72d3162e-cc78-11e3-81ab-4c9367dc0958',
        'x-github-event': 'push',
        'x-github-hook-id': '292430182',
      },
    });

    expect(receivedHeaders['x-github-event']).toBe('push');
    expect(receivedHeaders['x-github-delivery']).toBe('72d3162e-cc78-11e3-81ab-4c9367dc0958');
    expect(receivedHeaders['x-github-hook-id']).toBe('292430182');
  });
});

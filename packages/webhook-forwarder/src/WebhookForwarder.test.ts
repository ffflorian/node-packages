import http from 'node:http';
import {afterEach, beforeEach, describe, expect, it} from 'vitest';

import {WebhookForwarder} from './WebhookForwarder.js';

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

function closeServer(server: http.Server): Promise<void> {
  return new Promise(resolve => {
    server.close(() => resolve());
  });
}

function sendRequest(
  port: number,
  options: {body?: string; method?: string; path?: string} = {}
): Promise<{body: string; statusCode: number}> {
  return new Promise((resolve, reject) => {
    const req = http.request(
      {
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
  let targetPort: number;
  let forwarderPort: number;

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
        res.writeHead(200, {'Content-Type': 'application/json'});
        res.end(JSON.stringify({ok: true}));
      });
    });

    targetServer = target.server;
    targetPort = target.port;

    forwarder = new WebhookForwarder({
      host: '127.0.0.1',
      port: 0,
      targetUrl: `http://127.0.0.1:${targetPort}`,
    });

    await forwarder.start();
    const address = (forwarder as any).server.address();
    forwarderPort = address.port;

    const response = await sendRequest(forwarderPort, {body: '{"event":"push"}'});

    expect(response.statusCode).toBe(200);
    expect(response.body).toBe('{"ok":true}');
    expect(receivedMethod).toBe('POST');
    expect(receivedBody).toBe('{"event":"push"}');
  });

  it('forwards headers from the original request', async () => {
    let receivedHeaders: http.IncomingHttpHeaders = {};

    const target = await createTargetServer((req, res) => {
      receivedHeaders = req.headers;
      res.writeHead(200);
      res.end('ok');
    });

    targetServer = target.server;
    targetPort = target.port;

    forwarder = new WebhookForwarder({
      host: '127.0.0.1',
      port: 0,
      targetUrl: `http://127.0.0.1:${targetPort}`,
    });

    await forwarder.start();
    const address = (forwarder as any).server.address();
    forwarderPort = address.port;

    await new Promise<void>((resolve, reject) => {
      const req = http.request(
        {
          headers: {'content-type': 'application/json', 'x-custom-header': 'test-value'},
          hostname: '127.0.0.1',
          method: 'POST',
          path: '/',
          port: forwarderPort,
        },
        res => {
          res.on('data', () => {});
          res.on('end', resolve);
        }
      );
      req.on('error', reject);
      req.end('{}');
    });

    expect(receivedHeaders['content-type']).toBe('application/json');
    expect(receivedHeaders['x-custom-header']).toBe('test-value');
  });

  it('returns 404 for non-matching paths', async () => {
    const target = await createTargetServer((_req, res) => {
      res.writeHead(200);
      res.end('ok');
    });

    targetServer = target.server;
    targetPort = target.port;

    forwarder = new WebhookForwarder({
      host: '127.0.0.1',
      path: '/webhook',
      port: 0,
      targetUrl: `http://127.0.0.1:${targetPort}`,
    });

    await forwarder.start();
    const address = (forwarder as any).server.address();
    forwarderPort = address.port;

    const response = await sendRequest(forwarderPort, {path: '/other'});
    expect(response.statusCode).toBe(404);
  });

  it('returns 502 when target is unreachable', async () => {
    forwarder = new WebhookForwarder({
      host: '127.0.0.1',
      port: 0,
      targetUrl: 'http://127.0.0.1:1',
    });

    await forwarder.start();
    const address = (forwarder as any).server.address();
    forwarderPort = address.port;

    const response = await sendRequest(forwarderPort, {body: 'test'});
    expect(response.statusCode).toBe(502);
  });
});

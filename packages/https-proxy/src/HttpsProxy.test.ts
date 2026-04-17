import {describe, expect, test, vi} from 'vitest';

import {HttpsProxy} from './HttpsProxy.js';

describe('HttpsProxy', () => {
  test('disables authentication when no credentials are provided', () => {
    const proxy = new HttpsProxy({port: 8081});
    expect((proxy as any).authenticationEnabled).toBe(false);
  });

  test('enables authentication when username and password are provided', () => {
    const proxy = new HttpsProxy({password: 'secret', username: 'user'});
    expect((proxy as any).authenticationEnabled).toBe(true);
  });

  test('validates correct authorization header', () => {
    const proxy = new HttpsProxy({password: 'secret', username: 'user'});
    const header = `Basic ${Buffer.from('user:secret').toString('base64')}`;
    expect((proxy as any).validateAuthorization(header)).toBe(true);
  });

  test('rejects invalid authorization header', () => {
    const proxy = new HttpsProxy({password: 'secret', username: 'user'});
    const header = `Basic ${Buffer.from('user:wrong').toString('base64')}`;
    expect((proxy as any).validateAuthorization(header)).toBe(false);
  });

  test('onCreate responds with bad request for non-CONNECT request', () => {
    const proxy = new HttpsProxy({port: 8081});
    const req = {method: 'GET', socket: {remoteAddress: '127.0.0.1'}} as any;
    const res = {end: vi.fn(), writeHead: vi.fn()} as any;

    (proxy as any).onCreate(req, res);

    expect(res.writeHead).toHaveBeenCalledWith(400, {'Content-Type': 'text/plain'});
    expect(res.end).toHaveBeenCalledWith('Bad Request');
  });
});

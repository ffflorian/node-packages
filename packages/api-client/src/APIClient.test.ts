/* eslint-disable no-magic-numbers */

import {afterEach, describe, expect, test, vi} from 'vitest';

import {APIClient} from './APIClient.js';

describe('APIClient', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('adds query params and skips nullish params', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ok: true}), {status: 200}));
    vi.stubGlobal('fetch', fetchMock);
    const client = new APIClient('https://example.com');

    await client.get('/users', {params: {alpha: 1, beta: null, delta: 'x', gamma: undefined}});

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][0].toString()).toContain('/users?alpha=1&delta=x');
  });

  test('sets authorization header from auth config', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ok: true}), {status: 200}));
    vi.stubGlobal('fetch', fetchMock);
    const client = new APIClient('https://example.com', {auth: {password: 'pass', username: 'user'}});

    await client.get('/auth');

    const [, options] = fetchMock.mock.calls[0];
    expect((options as RequestInit).headers).toMatchObject({
      Authorization: `Basic ${Buffer.from('user:pass').toString('base64')}`,
    });
  });

  test('serializes object body and sets content-type', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ok: true}), {status: 200}));
    vi.stubGlobal('fetch', fetchMock);
    const client = new APIClient('https://example.com');

    await client.post('/items', {id: 1, name: 'abc'});

    const [, options] = fetchMock.mock.calls[0];
    expect(options).toMatchObject({
      body: JSON.stringify({id: 1, name: 'abc'}),
      method: 'POST',
    });
    expect((options as RequestInit).headers).toMatchObject({'Content-Type': 'application/json'});
  });

  test('throws status and response text for failed requests', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response('Bad input', {status: 400, statusText: 'Bad Request'}));
    vi.stubGlobal('fetch', fetchMock);
    const client = new APIClient('https://example.com');

    await expect(client.get('/fail')).rejects.toThrow('Request failed with status code 400: Bad input');
  });

  test('supports responseType text', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response('hello', {status: 200}));
    vi.stubGlobal('fetch', fetchMock);
    const client = new APIClient('https://example.com');

    const response = await client.get('/text', {responseType: 'text'});

    expect(response.data).toBe('hello');
    expect(response.status).toBe(200);
  });
});

import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {afterEach, describe, expect, test, vi} from 'vitest';

import {NtfyClient, publish} from './NtfyClient.js';

describe('NtfyClient', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('NtfyClient uses default server when publishing', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({id: '1'}), {status: 200}));
    vi.stubGlobal('fetch', fetchMock);
    const client = new NtfyClient();

    await client.publish({message: 'hi', topic: 'topic'} as any);

    expect(fetchMock.mock.calls[0][0]).toContain('https://ntfy.sh/topic');
  });

  test('publish throws when message and attachment are missing', async () => {
    await expect(publish({topic: 'topic'} as any)).rejects.toThrow('No message or file attachment specified');
  });

  test('publish sends bearer authorization header', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ok: true}), {status: 200}));
    vi.stubGlobal('fetch', fetchMock);

    await publish({authorization: 'token', message: 'hello', topic: 'topic'} as any);

    const [, options] = fetchMock.mock.calls[0];
    expect((options as RequestInit).headers).toMatchObject({Authorization: 'Bearer token'});
  });

  test('publish sends basic authorization header', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ok: true}), {status: 200}));
    vi.stubGlobal('fetch', fetchMock);

    await publish({
      authorization: {password: 'pass', username: 'user'},
      message: 'hello',
      topic: 'topic',
    } as any);

    const [, options] = fetchMock.mock.calls[0];
    expect((options as RequestInit).headers).toMatchObject({
      Authorization: `Basic ${Buffer.from('user:pass').toString('base64')}`,
    });
  });

  test('publish builds X-Actions header for multiple action types', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ok: true}), {status: 200}));
    vi.stubGlobal('fetch', fetchMock);

    await publish({
      actions: [
        {label: 'open', type: 'view', url: 'https://example.com'},
        {label: 'ping', method: 'post', type: 'http', url: 'https://example.com/ping'},
      ],
      message: 'hello',
      topic: 'topic',
    } as any);

    const [, options] = fetchMock.mock.calls[0];
    expect((options as any).headers['X-Actions']).toContain('view, open, https://example.com');
    expect((options as any).headers['X-Actions']).toContain('http, ping, https://example.com/ping, method=POST');
  });

  test('publish sends file attachment content as request body', async () => {
    const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'ntfy-'));
    const filePath = path.join(dir, 'sample.txt');
    await fs.writeFile(filePath, 'file body', 'utf-8');
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ok: true}), {status: 200}));
    vi.stubGlobal('fetch', fetchMock);

    await publish({fileAttachment: filePath, topic: 'topic'} as any);

    const [, options] = fetchMock.mock.calls[0];
    expect(Buffer.from((options as any).body).toString()).toBe('file body');
  });
});

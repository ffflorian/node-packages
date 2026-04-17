/* eslint-disable no-magic-numbers */

import {describe, expect, test, vi} from 'vitest';

const createSocketMock = vi.hoisted(() => vi.fn());

vi.mock('node:dgram', () => ({
  default: {
    createSocket: createSocketMock,
  },
}));

const modulePromise = import('./index.js');

function createSocketDouble() {
  const handlers: Record<string, (value?: any) => void> = {};
  return {
    close: vi.fn(),
    emit(event: string, value?: any) {
      handlers[event]?.(value);
    },
    on(event: string, callback: (value?: any) => void) {
      handlers[event] = callback;
      return this;
    },
    once(event: string, callback: (value?: any) => void) {
      handlers[event] = callback;
      return this;
    },
    send: vi.fn(),
  };
}

function makeNtpResponse(secondsSince1900: number): Buffer {
  const buffer = Buffer.alloc(48);
  buffer.writeUInt32BE(secondsSince1900, 40);
  buffer.writeUInt32BE(0, 44);
  return buffer;
}

describe('NTPClient', () => {
  test('uses default configuration values', async () => {
    const {NTPClient} = await modulePromise;
    const client = new NTPClient();
    expect((client as any).config.server).toBe('pool.ntp.org');
    expect((client as any).config.port).toBe(123);
  });

  test('applies constructor server and port arguments', async () => {
    const {NTPClient} = await modulePromise;
    const client = new NTPClient('time.example.com', 321);
    expect((client as any).config.server).toBe('time.example.com');
    expect((client as any).config.port).toBe(321);
  });

  test('resolves a Date from NTP response message', async () => {
    const socket = createSocketDouble();
    socket.send.mockImplementation((_msg, _offset, _length, _port, _server, callback) => {
      callback();
      queueMicrotask(() => socket.emit('message', makeNtpResponse(2_208_988_800)));
    });
    createSocketMock.mockReturnValue(socket);
    const {NTPClient} = await modulePromise;
    const client = new NTPClient({replyTimeout: 100, server: 'time.example.com'});

    const date = await client.getNetworkTime();

    expect(date).toBeInstanceOf(Date);
    expect(socket.close).toHaveBeenCalled();
  });

  test('rejects when socket send fails', async () => {
    const socket = createSocketDouble();
    socket.send.mockImplementation((_msg, _offset, _length, _port, _server, callback) => {
      callback(new Error('send failed'));
    });
    createSocketMock.mockReturnValue(socket);
    const {NTPClient} = await modulePromise;
    const client = new NTPClient({replyTimeout: 100});

    await expect(client.getNetworkTime()).rejects.toThrow('send failed');
  });

  test('rejects when socket emits error event', async () => {
    const socket = createSocketDouble();
    socket.send.mockImplementation((_msg, _offset, _length, _port, _server, callback) => {
      callback();
      queueMicrotask(() => socket.emit('error', new Error('socket broke')));
    });
    createSocketMock.mockReturnValue(socket);
    const {NTPClient} = await modulePromise;
    const client = new NTPClient({replyTimeout: 100});

    await expect(client.getNetworkTime()).rejects.toThrow('socket broke');
  });
});

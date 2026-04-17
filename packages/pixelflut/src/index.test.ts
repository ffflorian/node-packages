/* eslint-disable no-magic-numbers */

import {describe, expect, test, vi} from 'vitest';

const socketWriteMock = vi.hoisted(() => vi.fn());

class SocketDouble {
  private handlers: Record<string, (...args: any[]) => void> = {};

  on(event: string, handler: (...args: any[]) => void): this {
    this.handlers[event] = handler;
    return this;
  }

  pipe(): this {
    return this;
  }

  trigger(event: string, ...args: any[]): void {
    this.handlers[event]?.(...args);
  }

  write(message: string, callback: (error?: Error) => void): void {
    socketWriteMock(message);
    callback();
  }
}

vi.mock('node:net', () => ({
  default: {
    Socket: SocketDouble,
  },
}));

const modulePromise = import('./index.js');

describe('Pixelflut', () => {
  test('forces TCP when udp flag is true', async () => {
    const {Pixelflut} = await modulePromise;
    const pixelflut = new Pixelflut('localhost', 1234, 1, true);
    expect((pixelflut as any).udp).toBe(false);
  });

  test('sendPixel writes a PX command over tcp', async () => {
    const {Pixelflut} = await modulePromise;
    const pixelflut = new Pixelflut('localhost', 1234);
    vi.spyOn(pixelflut, 'createTCPConnection').mockResolvedValue(undefined);
    vi.spyOn(pixelflut as any, 'writeToTCP').mockResolvedValue(undefined);

    await pixelflut.sendPixel(5, 7, 'ff0000');

    expect((pixelflut as any).writeToTCP).toHaveBeenCalledWith('PX 5 7 ff0000\n');
  });

  test('sendPixels writes one PX command for each pixel', async () => {
    const {Pixelflut} = await modulePromise;
    const pixelflut = new Pixelflut('localhost', 1234);
    vi.spyOn(pixelflut, 'createTCPConnection').mockResolvedValue(undefined);
    vi.spyOn(pixelflut as any, 'writeToTCP').mockResolvedValue(undefined);

    await pixelflut.sendPixels([
      {color: 'ff0000', xPosition: 1, yPosition: 2},
      {color: '00ff00', xPosition: 3, yPosition: 4},
    ]);

    expect((pixelflut as any).writeToTCP).toHaveBeenCalledTimes(2);
  });

  test('writeToUDP rejects when no udp socket is present', async () => {
    const {Pixelflut} = await modulePromise;
    const pixelflut = new Pixelflut('localhost', 1234);
    await expect(pixelflut.writeToUDP('PX 1 1 ffffff\n')).rejects.toThrow('No UDP socket available');
  });

  test('failed tracks errors and returns true after tolerance is exceeded', async () => {
    const {Pixelflut} = await modulePromise;
    const pixelflut = new Pixelflut('localhost', 1234, 1);
    expect((pixelflut as any).failed('first')).toBe(false);
    expect((pixelflut as any).failed('second')).toBe(true);
  });
});

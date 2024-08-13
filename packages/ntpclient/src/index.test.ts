/* eslint-disable no-magic-numbers */
import type dgram from 'node:dgram';
import {assert, expect, describe, test, beforeEach, vi, afterEach} from 'vitest';
import {NTPClient} from './index.js';

const SECOND_IN_MILLIS = 1000;
const replyTimeout = 10 * SECOND_IN_MILLIS;

describe('NTP', () => {
  beforeEach(() => {
    vi.mock('dgram', async () => {
      const actual = (await vi.importActual('dgram')) as typeof dgram;
      const socket = actual.createSocket('udp4');
      return {
        ...actual,
        send: () => {
          socket.emit(
            'message',
            Buffer.from([
              0x1c, 0x02, 0x03, 0xe8, 0x00, 0x00, 0x02, 0x1a, 0x00, 0x00, 0x05, 0x12, 0xc0, 0x35, 0x67, 0x6c, 0xe9,
              0x03, 0x76, 0xff, 0xff, 0x97, 0x0f, 0x08, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xe9, 0x03,
              0x78, 0x0f, 0xe9, 0xd6, 0x4e, 0x10, 0xe9, 0x03, 0x78, 0x0f, 0xea, 0x03, 0x93, 0xf5,
            ])
          );
        },
      };
    });
  });
  afterEach(() => {
    vi.resetAllMocks();
  });

  test(
    'returns the current time',
    async () => {
      const ntpClient = new NTPClient({
        replyTimeout,
      });
      const data = await ntpClient.getNetworkTime();
      expect(data).toEqual(expect.any(Date));
    },
    replyTimeout
  );

  test(
    'works with another NTP server',
    async () => {
      const ntpClient = new NTPClient({
        replyTimeout,
        server: '0.pool.ntp.org',
      });
      const data = await ntpClient.getNetworkTime();
      expect(data).toEqual(expect.any(Date));
    },
    replyTimeout
  );

  test("doesn't work with an invalid NTP server", async () => {
    try {
      const ntpClient = new NTPClient({
        replyTimeout: SECOND_IN_MILLIS,
        server: 'google.com',
      });
      await ntpClient.getNetworkTime();
      assert.fail();
    } catch (error) {
      expect((error as Error).message).toContain('Timeout');
    }
  });
});

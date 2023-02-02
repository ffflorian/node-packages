/* eslint-disable no-magic-numbers */
import {NTPClient} from '../src';

const SECOND_IN_MILLIS = 1000;
const replyTimeout = 10 * SECOND_IN_MILLIS;

describe('NTP', () => {
  it(
    'displays the current time',
    async () => {
      const data = await new NTPClient({
        replyTimeout,
      }).getNetworkTime();
      expect(data).toEqual(jasmine.any(Date));
    },
    replyTimeout
  );

  it(
    'works with another NTP server',
    async () => {
      const data = await new NTPClient({
        replyTimeout,
        server: '0.pool.ntp.org',
      }).getNetworkTime();
      expect(data).toEqual(jasmine.any(Date));
    },
    replyTimeout
  );

  it("doesn't work with an invalid NTP server", async () => {
    try {
      await new NTPClient({
        replyTimeout: SECOND_IN_MILLIS,
        server: 'google.com',
      }).getNetworkTime();
      fail();
    } catch (error) {
      expect((error as Error).message).toContain('Timeout');
    }
  });
});

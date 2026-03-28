import nock from 'nock';
import {afterEach, beforeEach, describe, expect, test, vi} from 'vitest';

import {MyTimezone} from './MyTimezone.js';

vi.setConfig({
  // eslint-disable-next-line no-magic-numbers
  testTimeout: 10 * 1000, // 10 seconds
});

const nominatimAPI = 'https://nominatim.openstreetmap.org';
const HTTP_OK = 200;

describe('MyTimezone', () => {
  const myTimezone = new MyTimezone({
    offline: true,
  });

  nock(nominatimAPI)
    .get('/search')
    .query(true)
    .reply(function () {
      const parsedURL = new URL(this.req.path, 'http://example.com');
      const formattedAddress = parsedURL.searchParams.get('q');

      return [
        HTTP_OK,
        [
          {
            boundingbox: ['52.3570365', '52.6770365', '13.2288599', '13.5488599'],
            class: 'place',
            display_name: formattedAddress,
            icon: 'https://nominatim.openstreetmap.org/images/mapicons/poi_place_city.p.20.png',
            importance: 1.007539028249136,
            lat: '52.5170365',
            licence: 'Data © OpenStreetMap contributors, ODbL 1.0. https://osm.org/copyright',
            lon: '13.3888599',
            osm_id: 240109189,
            osm_type: 'node',
            place_id: 595794,
            type: 'city',
          },
        ],
      ];
    })
    .persist();

  test('returns an address from Nominatim', async () => {
    const location = 'Berlin, Germany';

    const {formattedAddress} = await myTimezone.getLocationByName(location);

    expect(formattedAddress).toBe(location);
  });

  test('returns the correct time for a location', async () => {
    // eslint-disable-next-line no-magic-numbers
    const berlinTime = await myTimezone.getDateByLongitude(13.40803);
    // eslint-disable-next-line no-magic-numbers
    const frankfurtTime = await myTimezone.getDateByLongitude(8.67931);

    expect(frankfurtTime.getTime() < berlinTime.getTime()).toBe(true);
  });

  test('returns the time for an address', async () => {
    const dataBerlin = await myTimezone.getDateByAddress('Berlin, Germany');
    expect(dataBerlin).toBeDefined();

    const dataMinsk = await myTimezone.getDateByAddress('Minsk, Belarus');
    expect(dataMinsk).toBeDefined();
  });

  describe('getDateByLongitude offset accuracy', () => {
    // Fix a known UTC time to make offset assertions deterministic
    const knownUTC = new Date('2024-06-21T12:00:00.000Z'); // noon UTC
    const ONE_HOUR_MS = 3_600_000;
    const ONE_MINUTE_MS = 60_000;
    const LONGITUDE_QUARTER = 90;
    const LONGITUDE_HALF = 180;
    const OFFSET_QUARTER = 6;
    const OFFSET_HALF = 12;
    const MINUTES_PER_DEGREE = 4;

    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(knownUTC);
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    test('longitude 0 (Greenwich) returns UTC time', async () => {
      const result = await myTimezone.getDateByLongitude(0);
      expect(result.getTime()).toBe(knownUTC.getTime());
    });

    test('longitude 180 returns UTC+12', async () => {
      const result = await myTimezone.getDateByLongitude(LONGITUDE_HALF);
      const expectedMillis = knownUTC.getTime() + OFFSET_HALF * ONE_HOUR_MS;
      expect(result.getTime()).toBe(expectedMillis);
    });

    test('longitude -180 returns UTC-12', async () => {
      const result = await myTimezone.getDateByLongitude(-LONGITUDE_HALF);
      const expectedMillis = knownUTC.getTime() - OFFSET_HALF * ONE_HOUR_MS;
      expect(result.getTime()).toBe(expectedMillis);
    });

    test('longitude 90 returns UTC+6', async () => {
      const result = await myTimezone.getDateByLongitude(LONGITUDE_QUARTER);
      const expectedMillis = knownUTC.getTime() + OFFSET_QUARTER * ONE_HOUR_MS;
      expect(result.getTime()).toBe(expectedMillis);
    });

    test('longitude -90 returns UTC-6', async () => {
      const result = await myTimezone.getDateByLongitude(-LONGITUDE_QUARTER);
      const expectedMillis = knownUTC.getTime() - OFFSET_QUARTER * ONE_HOUR_MS;
      expect(result.getTime()).toBe(expectedMillis);
    });

    test('each degree equals 4 minutes offset', async () => {
      const result1 = await myTimezone.getDateByLongitude(1);
      const result2 = await myTimezone.getDateByLongitude(2);
      const diffMinutes = (result2.getTime() - result1.getTime()) / ONE_MINUTE_MS;
      expect(diffMinutes).toBe(MINUTES_PER_DEGREE);
    });
  });
});

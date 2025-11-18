/* eslint-disable no-magic-numbers */
import {expect, describe, test, vi} from 'vitest';
import nock from 'nock';

import {MyTimezone} from './MyTimezone.js';

vi.setConfig({
  testTimeout: 10 * 1000, // 10 seconds
});
const nominatimAPI = 'https://nominatim.openstreetmap.org';

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
        200,
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
    const berlinTime = await myTimezone.getDateByLongitude(13.40803);
    const frankfurtTime = await myTimezone.getDateByLongitude(8.67931);

    expect(frankfurtTime.getTime() < berlinTime.getTime()).toBe(true);
  });

  test('returns the time for an address', async () => {
    const dataBerlin = await myTimezone.getDateByAddress('Berlin, Germany');
    expect(dataBerlin).toBeDefined();

    const dataMinsk = await myTimezone.getDateByAddress('Minsk, Belarus');
    expect(dataMinsk).toBeDefined();
  });
});

/* eslint-disable no-magic-numbers */
import {expect, describe, test, vi} from 'vitest';
import nock from 'nock';

import {MyTimezone} from './MyTimezone.js';

vi.setConfig({
  testTimeout: 10 * 1000, // 10 seconds
});
const nominatimAPI = 'https://nominatim.openstreetmap.org';

describe('MyTimezone', () => {
  const tz = new MyTimezone({
    offline: true,
  });
  let formatted_address: string;

  nock(nominatimAPI)
    .get('/search')
    .query(queryObject => {
      formatted_address = queryObject.q as string;
      return true;
    })
    .reply(() => [
      200,
      [
        {
          boundingbox: ['52.3570365', '52.6770365', '13.2288599', '13.5488599'],
          class: 'place',
          display_name: formatted_address,
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
    ])
    .persist();

  test('returns an address from Nominatim', async () => {
    const location = 'Berlin, Germany';

    const {formattedAddress} = await tz.getLocationByName(location);

    expect(formattedAddress).toBe(location);
  });

  test('returns the correct time for a location', async () => {
    const berlinTime = await tz.getDateByLongitude(13.40803);
    //console.log('Timezone at 52.51848, 13.40803:', berlinTime.toString());

    const frankfurtTime = await tz.getDateByLongitude(8.67931);
    //console.log('Timezone at 50.11796, 8.67931:', frankfurtTime.toString());

    expect(frankfurtTime.getTime() < berlinTime.getTime()).toBe(true);
  });

  test('returns the time for an address', async () => {
    const dataBerlin = await tz.getDateByAddress('Berlin, Germany');
    expect(dataBerlin).toBeDefined();
    //console.log('Timezone Berlin:', dataBerlin.toString());

    const dataMinsk = await tz.getDateByAddress('Minsk, Belarus');
    expect(dataMinsk).toBeDefined();
    //console.log('Timezone Minsk:', dataMinsk.toString());
  });
});

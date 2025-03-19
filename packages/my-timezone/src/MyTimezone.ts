import axios, {AxiosError, AxiosRequestConfig} from 'axios';
import {NTPClient} from 'ntpclient';

export enum DIRECTION {
  EAST = 'E',
  WEST = 'W',
}

export interface CustomDate {
  day: string;
  hours: string;
  minutes: string;
  month: string;
  seconds: string;
  year: string;
}

export interface OSMResult {
  boundingbox?: string[] | null;
  class: string;
  display_name: string;
  icon?: string | null;
  importance: number;
  lat: string;
  licence: string;
  lon: string;
  osm_id: number;
  osm_type: string;
  place_id: number;
  type: string;
}

export interface MyTimezoneConfig {
  ntpServer?: string;
  offline?: boolean;
}

export interface Coordinates {
  longitude: number;
}

export interface Location extends Coordinates {
  formattedAddress?: string;
}

const defaultConfig: Required<MyTimezoneConfig> = {
  ntpServer: 'pool.ntp.org',
  offline: false,
};

const nominatimAPI = 'https://nominatim.openstreetmap.org';

export class MyTimezone {
  private readonly config: Required<MyTimezoneConfig>;
  private readonly ntpClient: NTPClient;

  constructor(config?: MyTimezoneConfig) {
    this.config = {
      ...defaultConfig,
      ...config,
    };
    this.ntpClient = new NTPClient(this.config.ntpServer);
  }

  public async getLocation(location: string): Promise<Location> {
    try {
      const coordinates = this.parseCoordinates(location);
      return coordinates;
    } catch (error) {
      if ((error as Error).message.includes('No coordinates parsed')) {
        return this.getLocationByName(location);
      }
      throw error;
    }
  }

  public async getLocationByName(address: string, radius?: string): Promise<Location> {
    const requestConfig: AxiosRequestConfig = {
      method: 'get',
      params: {
        format: 'json',
        limit: 9,
        // eslint-disable-next-line id-length
        q: address,
      },
      url: `${nominatimAPI}/search`,
    };

    if (radius) {
      requestConfig.params.radius = radius;
    }

    let results: OSMResult[];

    try {
      const response = await axios.request<OSMResult[]>(requestConfig);
      results = response.data;
    } catch (error) {
      throw new Error(`Nominatim API Error: ${(error as AxiosError).message}`);
    }

    if (!results.length) {
      throw new Error('No place found.');
    }

    const {display_name, lon} = results[0];
    const parsedLongitude = parseFloat(lon);

    return {
      formattedAddress: display_name,
      longitude: parsedLongitude,
    };
  }

  public async getDateByAddress(address: string): Promise<Date> {
    const {longitude} = await this.getLocationByName(address);
    return this.getDateByLongitude(longitude);
  }

  public async getDateByLongitude(longitude: number): Promise<Date> {
    const direction = longitude < 0 ? DIRECTION.WEST : DIRECTION.EAST;
    const utcDate = await this.getUTCDate();
    const offsetMillis = this.getOffsetMillis(longitude, direction);

    const calculatedDate =
      direction === DIRECTION.EAST
        ? new Date(utcDate.getTime() + offsetMillis)
        : new Date(utcDate.getTime() - offsetMillis);
    return calculatedDate;
  }

  public parseCoordinates(coordinates: string): Coordinates {
    const longitudeRegex = new RegExp('[-?\\W\\d\\.]+,(?<longitude>[-?\\W\\d\\.]+)');
    const parsedRegex = longitudeRegex.exec(coordinates);
    if (parsedRegex?.groups?.longitude) {
      try {
        const longitude = parseFloat(parsedRegex.groups.longitude);
        return {longitude};
      } catch {
        throw new Error(`Invalid coordinates: "${coordinates}"`);
      }
    }
    throw new Error(`No coordinates parsed: "${coordinates}"`);
  }

  public parseDate(date: Date): CustomDate {
    const isoString = date.toISOString();
    const dateRegex =
      /(?<year>\d{4})-(?<month>\d{2})-(?<day>\d{2})T(?<hours>\d{2}):(?<minutes>\d{2}):(?<seconds>\d{2})/g;
    const parsedString = dateRegex.exec(isoString);
    if (!parsedString?.groups) {
      throw new Error('Could not parse date');
    }
    const {year, month, day, hours, minutes, seconds} = parsedString.groups!;
    return {day, hours, minutes, month, seconds, year};
  }

  private getOffsetMillis(longitudeDegrees: number, direction: DIRECTION): number {
    const oneHourInMillis = 3_600_000;
    const dayInHours = 24;
    const degreesOnEarth = 360;
    const dir = direction === DIRECTION.EAST ? 1 : -1;
    const offsetHours = (dir * longitudeDegrees * dayInHours) / degreesOnEarth;
    return offsetHours * oneHourInMillis;
  }

  private async getUTCDate(): Promise<Date> {
    return this.config.offline ? new Date() : this.ntpClient.getNetworkTime();
  }
}

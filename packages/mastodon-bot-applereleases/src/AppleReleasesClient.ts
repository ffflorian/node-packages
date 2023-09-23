import {Config} from './Config';

import RSSParser from 'rss-parser';

enum ConfigKeys {
  ACCESS_TOKEN = 'accessToken',
  BASE_URL = 'baseURL',
  DRY_RUN = 'dryRun',
  FORCE_SENDING = 'forceSending',
  LAST_TOOT_DATE = 'lastTootDate',
}

interface RSSEntry {
  content: string;
  'content:encoded': string;
  'content:encodedSnippet': string;
  contentSnippet: string;
  guid: string;
  isoDate: string;
  link: string;
  pubDate: string;
  title: string;
}

export type CmdConfig = Partial<Record<ConfigKeys, string | boolean>> & {configFile?: string};

export class AppleReleasesClient {
  private readonly baseURL: string;
  private readonly accessToken: string;
  private readonly config: Config<ConfigKeys>;
  private readonly dryRun?: boolean;
  private readonly forceSending?: boolean;
  private readonly rssParser: RSSParser<RSSEntry>;

  constructor(cmdConfig?: CmdConfig) {
    this.config = new Config<ConfigKeys>(cmdConfig?.configFile || 'config.json');
    this.dryRun = cmdConfig?.dryRun || this.config.get(ConfigKeys.DRY_RUN);
    this.forceSending = cmdConfig?.forceSending || this.config.get(ConfigKeys.FORCE_SENDING);
    this.baseURL = cmdConfig?.baseURL || this.config.get(ConfigKeys.BASE_URL);
    this.accessToken = cmdConfig?.accessToken || this.config.get(ConfigKeys.ACCESS_TOKEN);
    this.rssParser = new RSSParser<RSSEntry>();

    if (!this.baseURL || !this.accessToken) {
      throw new Error('No baseURL or access token specified.');
    }

    if (!/^https?:\/\//.test(this.baseURL)) {
      throw new Error(`Error: The base URL needs to begin with "http(s)://".`);
    }
  }

  async run() {
    await this.getUpdates();
  }

  async getUpdates() {
    const parsed = await this.rssParser.parseURL('https://developer.apple.com/news/releases/rss/releases.rss');
    const mapped = parsed.items
      .filter(item => item.title?.includes('.'))
      .map(item => ({
        link: item.link,
        pubDate: new Date(item.pubDate || ''),
        title: item.title?.replaceAll('  ', '') || '',
      }))
      .sort((itemA, itemB) => itemA.pubDate.getTime() - itemB.pubDate.getTime());

    console.info(mapped);
  }
}

import generator from 'megalodon';
import axios from 'axios';
import {Config} from './Config.js';
import {publish as ntfyPublish} from 'ntfy';

const CsvHeaders = [
  'Datum',
  'Bundesland',
  'BundeslandId_Impfort',
  'Impfungen_gesamt',
  'Impfungen_gesamt_min1',
  'Impfungen_gesamt_00bis04_min1',
  'Impfungen_gesamt_gi',
  'Impfungen_gesamt_00bis04_gi',
  'Impfungen_gesamt_boost1',
  'Impfungen_gesamt_boost2',
  'Impfungen_gesamt_boost3',
  'Impfungen_gesamt_boost4',
  'Impfquote_gesamt_min1',
  'Impfquote_05bis17_min1',
  'Impfquote_05bis11_min1',
  'Impfquote_12bis17_min1',
  'Impfquote_18plus_min1',
  'Impfquote_18bis59_min1',
  'Impfquote_60plus_min1',
  'Impfquote_gesamt_gi',
  'Impfquote_05bis17_gi',
  'Impfquote_05bis11_gi',
  'Impfquote_12bis17_gi',
  'Impfquote_18plus_gi',
  'Impfquote_18bis59_gi',
  'Impfquote_60plus_gi',
  'Impfquote_gesamt_boost1',
  'Impfquote_12bis17_boost1',
  'Impfquote_18plus_boost1',
  'Impfquote_18bis59_boost1',
  'Impfquote_60plus_boost1',
  'Impfquote_gesamt_boost2',
  'Impfquote_12bis17_boost2',
  'Impfquote_18plus_boost2',
  'Impfquote_18bis59_boost2',
  'Impfquote_60plus_boost2',
] as const;

type CSV = {[K in (typeof CsvHeaders)[number]]: string};

enum CSVKeys {
  CSV_COLUMN_BOOST = 'Impfquote_gesamt_boost1',
  CSV_COLUMN_BOOST2 = 'Impfquote_gesamt_boost2',
  CSV_COLUMN_DATE = 'Datum',
  CSV_COLUMN_ERST = 'Impfquote_gesamt_min1',
  CSV_COLUMN_VOLL = 'Impfquote_gesamt_gi',
}

enum ConfigKeys {
  ACCESS_TOKEN = 'accessToken',
  BASE_URL = 'baseURL',
  DRY_RUN = 'dryRun',
  FORCE_SENDING = 'forceSending',
  LAST_TOOT_DATE = 'last_toot_date',
  LAST_TOOT_IMPF_QUOTE_BOOST = 'last_toot_impf_quote_boost',
  LAST_TOOT_IMPF_QUOTE_BOOST2 = 'last_toot_impf_quote_boost2',
  LAST_TOOT_IMPF_QUOTE_ERST = 'last_toot_impf_quote_erst',
  LAST_TOOT_IMPF_QUOTE_VOLL = 'last_toot_impf_quote_voll',
  NTFY_TOPIC = 'ntfyTopic',
}

export type CmdConfig = Partial<Record<ConfigKeys, string | boolean>> & {configFile?: string};

export class ImpfstatusClient {
  public readonly CSV_URL =
    'https://raw.githubusercontent.com/robert-koch-institut/COVID-19-Impfungen_in_Deutschland/master/Aktuell_Deutschland_Impfquoten_COVID-19.csv';
  private readonly baseURL: string;
  private readonly accessToken: string;
  private readonly config: Config<ConfigKeys>;
  private readonly dryRun?: boolean;
  private readonly forceSending?: boolean;
  private readonly ntfyTopic?: string;

  constructor(cmdConfig?: CmdConfig) {
    this.config = new Config<ConfigKeys>(cmdConfig?.configFile || 'config.json');
    this.dryRun = cmdConfig?.dryRun || this.config.get(ConfigKeys.DRY_RUN);
    this.forceSending = cmdConfig?.forceSending || this.config.get(ConfigKeys.FORCE_SENDING);
    this.baseURL = cmdConfig?.baseURL || this.config.get(ConfigKeys.BASE_URL);
    this.accessToken = cmdConfig?.accessToken || this.config.get(ConfigKeys.ACCESS_TOKEN);
    this.ntfyTopic = cmdConfig?.ntfyTopic || this.config.get(ConfigKeys.NTFY_TOPIC);

    if (!this.baseURL || !this.accessToken) {
      throw new Error('No baseURL or access token specified.');
    }

    if (!/^https?:\/\//.test(this.baseURL)) {
      throw new Error(`Error: The base URL needs to begin with "http(s)://".`);
    }
  }

  private generateProgressbar(percentage: number): string {
    const numChars = 15;
    const numFilled = Math.round((percentage / 100) * numChars);
    const numEmpty = numChars - numFilled;
    const displayPercentage = percentage.toString().replace('.', ',');
    return `${'▓'.repeat(numFilled)}${'░'.repeat(numEmpty)} ${displayPercentage}%`;
  }

  private async getCurrentData(url: string): Promise<CSV | undefined> {
    console.info('Downloading data ...');
    const {data} = await axios.get<string>(url);
    const lines = data.split('\n');

    console.info('Got', lines.length, 'lines.\n');
    const fields = lines.filter(line => line.includes('Deutschland'))[0]?.split(',');
    if (CsvHeaders.length !== fields.length) {
      const errorMessage = `Source's field length doesn't match local field length`;
      if (this.ntfyTopic) {
        void ntfyPublish({
          message: errorMessage,
          tags: 'warning',
          title: 'Error in impfstatus-bot-mastodon',
          topic: this.ntfyTopic,
        });
      }
      throw new Error(errorMessage);
    }
    return fields.reduce((obj, line, index) => ({...obj, [CsvHeaders[index]]: line}), {} as CSV);
  }

  private generateMessage(data: CSV): string {
    const barErst = this.generateProgressbar(Number(data[CSVKeys.CSV_COLUMN_ERST]));
    const barVoll = this.generateProgressbar(Number(data[CSVKeys.CSV_COLUMN_VOLL]));
    const barBoost = this.generateProgressbar(Number(data[CSVKeys.CSV_COLUMN_BOOST]));
    const barBoost2 = this.generateProgressbar(Number(data[CSVKeys.CSV_COLUMN_BOOST2]));
    return `${barErst} mind. eine Impfdosis\n${barVoll} grundimmunisiert\n${barBoost} erste Auffrischimpfung\n${barBoost2} zweite Auffrischimpfung`;
  }

  private checkIfShouldToot(data: CSV): boolean {
    if (this.dryRun) {
      console.info('\n[DRY RUN] Do not toot\n');
      return false;
    } else if (this.forceSending) {
      console.info('Force sending is activated, time to toot!');
      return true;
    }

    const lastDate = new Date(this.config.get(ConfigKeys.LAST_TOOT_DATE) || 0).getTime();
    const currDate = new Date(data[CSVKeys.CSV_COLUMN_DATE]).getTime();
    console.info(`date: ${this.config.get(ConfigKeys.LAST_TOOT_DATE) || 0} / ${data[CSVKeys.CSV_COLUMN_DATE]}`);

    if (lastDate < currDate) {
      const impf_quote_erst_old = Number(this.config.get(ConfigKeys.LAST_TOOT_IMPF_QUOTE_ERST) || 0);
      const impf_quote_voll_old = Number(this.config.get(ConfigKeys.LAST_TOOT_IMPF_QUOTE_VOLL) || 0);
      const impf_quote_boost_old = Number(this.config.get(ConfigKeys.LAST_TOOT_IMPF_QUOTE_BOOST) || 0);
      const impf_quote_boost2_old = Number(this.config.get(ConfigKeys.LAST_TOOT_IMPF_QUOTE_BOOST2) || 0);

      const impf_quote_erst_new = Number(data[CSVKeys.CSV_COLUMN_ERST]);
      const impf_quote_voll_new = Number(data[CSVKeys.CSV_COLUMN_VOLL]);
      const impf_quote_boost_new = Number(data[CSVKeys.CSV_COLUMN_BOOST]);
      const impf_quote_boost2_new = Number(data[CSVKeys.CSV_COLUMN_BOOST2]);

      console.info(`erst: ${impf_quote_erst_old} / ${impf_quote_erst_new}`);
      console.info(`voll: ${impf_quote_voll_old} / ${impf_quote_voll_new}`);
      console.info(`boost: ${impf_quote_boost_old} / ${impf_quote_boost_new}`);
      console.info(`boost2: ${impf_quote_boost2_old} / ${impf_quote_boost2_new}`);

      if (
        impf_quote_erst_old < impf_quote_erst_new ||
        impf_quote_voll_old < impf_quote_voll_new ||
        impf_quote_boost_old < impf_quote_boost_new ||
        impf_quote_boost2_old < impf_quote_boost2_new
      ) {
        console.info('Data or time has significantly changed, time to toot!');
        return true;
      }
      console.info('Values have not changed: Do not toot');
      return false;
    }
    console.info('Date is same or older: Do not toot');
    return false;
  }

  private saveState(data: CSV): void {
    if (this.dryRun) {
      console.info('\n[DRY RUN] Not updating the state configuration\n');
      return;
    }

    console.info('Saving current state ...');

    this.config.set(ConfigKeys.LAST_TOOT_DATE, data[CSVKeys.CSV_COLUMN_DATE]);
    this.config.set(ConfigKeys.LAST_TOOT_IMPF_QUOTE_ERST, data[CSVKeys.CSV_COLUMN_ERST]);
    this.config.set(ConfigKeys.LAST_TOOT_IMPF_QUOTE_VOLL, data[CSVKeys.CSV_COLUMN_VOLL]);
    this.config.set(ConfigKeys.LAST_TOOT_IMPF_QUOTE_BOOST, data[CSVKeys.CSV_COLUMN_BOOST]);
    this.config.set(ConfigKeys.LAST_TOOT_IMPF_QUOTE_BOOST2, data[CSVKeys.CSV_COLUMN_BOOST2]);
  }

  async run() {
    const data = await this.getCurrentData(this.CSV_URL);
    if (!data) {
      const errorMessage = 'No matching data found in the CSV';
      if (this.ntfyTopic) {
        void ntfyPublish({
          message: errorMessage,
          tags: 'warning',
          title: 'Error in impfstatus-bot-mastodon',
          topic: this.ntfyTopic,
        });
      }
      throw new Error(errorMessage);
    }

    console.info('Created message:\n');
    const progressMessage = this.generateMessage(data);
    console.info(progressMessage);

    const shouldSend = this.checkIfShouldToot(data);

    console.info('Send toot?', shouldSend, '\n');

    if (shouldSend) {
      console.info('Sending toot ...');
      await this.toot(progressMessage);
    }
    this.saveState(data);
  }

  private async toot(text: string): Promise<void> {
    const client = generator('mastodon', this.baseURL, this.accessToken);
    await client.postStatus(text, {spoiler_text: 'Automatisierter Impfstatus'});
  }
}

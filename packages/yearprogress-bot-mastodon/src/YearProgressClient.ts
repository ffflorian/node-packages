import generator from 'megalodon';
import {Config} from './Config';

enum ConfigKeys {
  ACCESS_TOKEN = 'accessToken',
  BASE_URL = 'baseURL',
  DRY_RUN = 'dryRun',
  FORCE_SENDING = 'forceSending',
  LAST_PROGRESS = 'lastProgress',
  LAST_TOOT_DATE = 'lastTootDate',
}

export type CmdConfig = Partial<Record<ConfigKeys, string | boolean>> & {configFile?: string};

export class YearProgressClient {
  private readonly baseURL: string;
  private readonly accessToken: string;
  private readonly config: Config<ConfigKeys>;
  private readonly dryRun?: boolean;
  private readonly forceSending?: boolean;

  constructor(cmdConfig?: CmdConfig) {
    this.config = new Config<ConfigKeys>(cmdConfig?.configFile || 'config.json');
    this.dryRun = cmdConfig?.dryRun || this.config.get(ConfigKeys.DRY_RUN);
    this.forceSending = cmdConfig?.forceSending || this.config.get(ConfigKeys.FORCE_SENDING);
    this.baseURL = cmdConfig?.baseURL || this.config.get(ConfigKeys.BASE_URL);
    this.accessToken = cmdConfig?.accessToken || this.config.get(ConfigKeys.ACCESS_TOKEN);

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
    return `${'▓'.repeat(numFilled)}${'░'.repeat(numEmpty)}`;
  }

  private calculatePercentage(date: string): number {
    const now = new Date(date);
    const yearStart = new Date(now.getFullYear(), 0, 1);

    const yearEnd = new Date(now.getFullYear() + 1, 0, 1);

    const totalDuration = yearEnd.getTime() - yearStart.getTime();
    const currentDuration = now.getTime() - yearStart.getTime();

    return Number(((currentDuration / totalDuration) * 100).toFixed());
  }

  private generateMessage(percentage: number): string {
    const progressBar = this.generateProgressbar(percentage);
    return `${progressBar} ${percentage}%`;
  }

  private checkIfShouldToot(percentage: number, date: string): boolean {
    if (this.dryRun) {
      console.info('\n[DRY RUN] Do not toot\n');
      return false;
    } else if (this.forceSending) {
      console.info('Force sending is activated, time to toot!');
      return true;
    }

    const lastDate = new Date(this.config.get(ConfigKeys.LAST_TOOT_DATE) || 0).getTime();
    const currentDate = new Date(date).getTime();
    console.info(`date: ${this.config.get(ConfigKeys.LAST_TOOT_DATE) || 0} / ${date}`);

    if (lastDate < currentDate) {
      const lastProgress = Number(this.config.get(ConfigKeys.LAST_PROGRESS) || 0);

      console.info(`progress: ${lastProgress} / ${percentage}`);

      if (lastProgress < percentage) {
        console.info('Progress has changed, time to toot!');
        return true;
      }
      console.info('Progress has not changed: Do not toot');
      return false;
    }
    console.info('Date is same or older: Do not toot');
    return false;
  }

  private saveState(percentage: number, currentDate: string): void {
    if (this.dryRun) {
      console.info('\n[DRY RUN] Not updating the state configuration\n');
      return;
    }

    console.info('Saving current state ...');

    this.config.set(ConfigKeys.LAST_TOOT_DATE, currentDate);
    this.config.set(ConfigKeys.LAST_PROGRESS, percentage);
  }

  async run() {
    const date = new Date().toISOString().slice(0, 10);
    const percentage = this.calculatePercentage(date);
    if (isNaN(percentage)) {
      throw new Error(`Invalid percentage calculated: ${percentage}`);
    }

    console.info('Created message:\n');
    const progressMessage = this.generateMessage(percentage);
    console.info(progressMessage);

    const shouldSend = this.checkIfShouldToot(percentage, date);

    console.info('Send toot?', shouldSend, '\n');

    if (shouldSend) {
      console.info('Sending toot ...');
      await this.toot(progressMessage);
    }
    this.saveState(percentage, date);
  }

  private async toot(text: string): Promise<void> {
    const client = generator('mastodon', this.baseURL, this.accessToken);
    await client.postStatus(text, {spoiler_text: `Year's progress`});
  }
}

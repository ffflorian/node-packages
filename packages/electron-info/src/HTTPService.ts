import fs from 'node:fs/promises';
import {inspect} from 'node:util';
import axios from 'axios';
import logdown from 'logdown';

import type {Options, RawReleaseInfo} from './ElectronInfo.js';

export type HTTPOptions = Pick<Options, 'debug' | 'timeout'>;

export class HTTPService {
  private readonly logger: logdown.Logger;
  private readonly options: Required<HTTPOptions>;

  constructor(options: Required<HTTPOptions>) {
    this.options = options;
    this.logger = logdown('electron-info/HTTPService', {
      logger: console,
      markdown: false,
    });
    if (this.options.debug) {
      this.logger.state.isEnabled = true;
    }
    this.logger.log('Initialized', this.options);
  }

  public async downloadReleasesFile(downloadUrl: string, targetFile: string): Promise<RawReleaseInfo[]> {
    this.logger.log('Downloading releases file:', {downloadUrl, targetFile});

    let releases = [];

    try {
      const response = await axios.get<RawReleaseInfo[]>(downloadUrl, {timeout: this.options.timeout});
      releases = response.data;
    } catch (error) {
      throw new Error(`Request failed: "${(error as Error).message}"`);
    }

    // eslint-disable-next-line no-magic-numbers
    this.logger.info('Received data from server:', inspect(releases).toString().slice(0, 40), '...');

    if (!Array.isArray(releases)) {
      throw new Error('Invalid data received from server');
    }

    await fs.writeFile(targetFile, JSON.stringify(releases));
    return releases;
  }
}

import {isAfter as isAfterDate, sub as subtractDate} from 'date-fns';
import {constants as fsConstants, promises as fs} from 'fs';
import parseUrl from 'parse-url';
import logdown from 'logdown';
import * as os from 'os';
import * as path from 'path';

import type {Options, RawReleaseInfo} from './ElectronInfo';
import {HTTPService} from './HTTPService';

export class FileService {
  private readonly httpService: HTTPService;
  private readonly logger: logdown.Logger;
  private readonly options: Required<Options>;

  constructor(options: Required<Options>) {
    this.options = options;
    this.logger = logdown('electron-info/FileService', {
      logger: console,
      markdown: false,
    });
    if (this.options.debug) {
      this.logger.state.isEnabled = true;
    }
    this.logger.log('Initialized', this.options);
    this.httpService = new HTTPService({
      debug: this.options.debug,
      timeout: this.options.timeout,
    });
  }

  async getReleases(): Promise<RawReleaseInfo[]> {
    this.logger.log('Parsing releases URL', {releasesUrl: this.options.releasesUrl});
    const parsedUrl = parseUrl(this.options.releasesUrl);
    if (!parsedUrl.href) {
      throw new Error('Invalid releases URL provided');
    }

    if (parsedUrl.protocol === 'file') {
      this.logger.log('Releases URL points to a local file:', {releasesUrl: this.options.releasesUrl});
      return this.loadReleasesFile(path.resolve(this.options.releasesUrl));
    }

    this.logger.log('Releases URL points to a URL:', {releasesUrl: this.options.releasesUrl});

    const tempDirectory = await this.createTempDir();
    const tempFile = path.join(tempDirectory, 'latest.json');
    const tempFileExists = await this.isPathReadable(tempFile);

    if (this.options.forceUpdate) {
      this.logger.log(`Force download of the releases file requested`, {
        forceUpdate: this.options.forceUpdate,
        releasesUrl: this.options.releasesUrl,
        tempFile,
      });
      return this.httpService.downloadReleasesFile(this.options.releasesUrl, tempFile);
    }

    if (tempFileExists) {
      this.logger.log('Found a local copy of the releases file:', {tempFile});

      const tempFileFromToday = await this.isFileFromToday(tempFile);
      this.logger.log(`Releases file "${tempFile}" is less than 24 hours old:`, tempFileFromToday);

      if (tempFileFromToday) {
        return this.loadReleasesFile(tempFile);
      }
    }

    return this.httpService.downloadReleasesFile(this.options.releasesUrl, tempFile);
  }

  private async createTempDir(): Promise<string> {
    const tempDirectory = this.options.tempDirectory || path.join(os.tmpdir(), 'electron-info');
    const tempDirectoryExists = await this.isPathReadable(tempDirectory);

    if (!tempDirectoryExists) {
      this.logger.log('Creating temp directory', {tempDirectory});
      await fs.mkdir(tempDirectory);
    } else {
      this.logger.log('Temp directory exists', {tempDirectory});
    }

    return tempDirectory;
  }

  private async isFileFromToday(fileName: string): Promise<boolean> {
    const {mtime: fileModifiedDate} = await fs.stat(fileName);
    this.logger.log(`File "${fileName}" is from "${fileModifiedDate.toString()}"`);

    const yesterday = subtractDate(new Date(), {days: 1});
    return isAfterDate(fileModifiedDate, yesterday);
  }

  private async isPathReadable(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath, fsConstants.F_OK | fsConstants.R_OK);
      return true;
    } catch (error) {
      this.logger.log('File is not readable:', {errorMessage: (error as Error).message});
      return false;
    }
  }

  private async loadReleasesFile(localPath: string): Promise<RawReleaseInfo[]> {
    this.logger.log('Loading local releases file:', {localPath});
    const rawData = await fs.readFile(localPath, 'utf8');
    const releases = JSON.parse(rawData);

    if (!Array.isArray(releases)) {
      throw new Error('Invalid data in releases file');
    }

    return releases;
  }
}

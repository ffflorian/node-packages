import path from 'node:path';
import fs from 'fs-extra';
import logdown from 'logdown';

import type {TerminalOptions} from './interfaces.js';

export class FileService {
  private readonly logger: logdown.Logger;
  private readonly options: Required<TerminalOptions>;
  constructor(options: Required<TerminalOptions>) {
    this.options = options;
    this.logger = logdown('jszip-cli/FileService', {
      logger: console,
      markdown: false,
    });
    this.logger.state.isEnabled = this.options.verbose;
  }

  public async dirExists(dirPath: string): Promise<boolean> {
    try {
      await fs.access(dirPath, fs.constants.F_OK);
      try {
        await fs.access(dirPath, fs.constants.W_OK);
        return true;
      } catch {
        this.logger.info(`Directory "${dirPath}" exists but is not writable.`);
        return false;
      }
    } catch {
      this.logger.info(`Directory "${dirPath}" doesn't exist.`, this.options.force ? 'Creating.' : 'Not creating.');
      if (this.options.force) {
        await fs.ensureDir(dirPath);
        return true;
      }
      return false;
    }
  }

  public async fileIsReadable(filePath: string): Promise<boolean> {
    const dirExists = await this.dirExists(path.dirname(filePath));
    if (dirExists) {
      try {
        await fs.access(filePath, fs.constants.F_OK | fs.constants.R_OK);
        return true;
      } catch {
        return false;
      }
    }
    return false;
  }

  public async fileIsWritable(filePath: string): Promise<boolean> {
    const dirName = path.dirname(filePath);
    const dirExists = await this.dirExists(dirName);
    if (dirExists) {
      try {
        await fs.access(filePath, fs.constants.F_OK | fs.constants.R_OK);
        this.logger.info(
          `File "${filePath}" already exists.`,
          this.options.force ? 'Forcing overwrite.' : 'Not overwriting.'
        );
        return this.options.force;
      } catch {
        return true;
      }
    }
    return false;
  }

  public async writeFile(data: Buffer, filePath: string): Promise<FileService> {
    const fileIsWritable = await this.fileIsWritable(filePath);
    if (fileIsWritable) {
      await fs.writeFile(filePath, data);
      return this;
    }
    throw new Error(`File "${this.options.outputEntry}" already exists.`);
  }
}

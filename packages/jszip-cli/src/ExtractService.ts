import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import JSZip from 'jszip';
import logdown from 'logdown';
import progress from 'progress';

import {TerminalOptions} from './interfaces.js';

export class ExtractService {
  public extractedFilesCount: number;
  public outputDir: string | null;
  private readonly logger: logdown.Logger;
  private readonly options: Required<TerminalOptions>;
  private readonly progressBar: progress;

  constructor(options: Required<TerminalOptions>) {
    this.options = options;
    this.logger = logdown('jszip-cli/ExtractService', {
      logger: console,
      markdown: false,
    });
    this.logger.state.isEnabled = this.options.verbose;
    this.outputDir = this.options.outputEntry ? path.resolve(this.options.outputEntry) : null;
    this.progressBar = new progress('Extracting [:bar] :percent :elapseds', {
      complete: '=',
      incomplete: ' ',
      total: 100,
      width: 20,
    });
    this.extractedFilesCount = 0;
  }

  public async extract(rawEntries: string[]): Promise<ExtractService> {
    const isWin32 = os.platform() === 'win32';

    for (const entry of rawEntries) {
      const jszip = new JSZip();
      if (this.outputDir) {
        try {
          await fs.mkdir(this.outputDir, {recursive: true});
        } catch {
          // no-op
        }
      }

      const resolvedPath = path.resolve(entry);
      const data = await fs.readFile(resolvedPath);
      const entries: Array<[string, JSZip.JSZipObject]> = [];

      await jszip.loadAsync(data, {createFolders: true});

      if (!this.outputDir) {
        await this.printStream(jszip.generateNodeStream());
        return this;
      }

      jszip.forEach((filePath, entry) => {
        if (filePath.includes('..')) {
          this.logger.info(`Skipping bad path "${filePath}"`);
        } else {
          entries.push([filePath, entry]);
        }
      });

      let lastPercent = 0;
      let index = 0;

      for (const [filePath, entry] of entries) {
        const resolvedFilePath = path.join(this.outputDir, filePath);
        if (entry.dir) {
          try {
            await fs.mkdir(resolvedFilePath, {recursive: true});
          } catch {
            // no-op
          }
        } else {
          const data = await entry.async('nodebuffer');
          await fs.writeFile(resolvedFilePath, data, {
            encoding: 'utf-8',
          });

          this.extractedFilesCount++;

          const diff = Math.floor(index / entries.length) - Math.floor(lastPercent);
          if (diff && !this.options.quiet) {
            this.progressBar.tick(diff);
            lastPercent = Math.floor(index / entries.length);
          }
        }

        if (isWin32) {
          if (entry.dosPermissions) {
            await fs.chmod(resolvedFilePath, entry.dosPermissions);
          }
        } else if (entry.unixPermissions) {
          await fs.chmod(resolvedFilePath, entry.unixPermissions);
        }
        index++;
      }
    }
    return this;
  }

  private printStream(fileStream: NodeJS.ReadableStream): Promise<void> {
    return new Promise((resolve, reject) => {
      const stream = fileStream.pipe(process.stdout);
      stream.on('finish', resolve);
      stream.on('error', reject);
    });
  }
}

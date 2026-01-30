import {glob} from 'glob';
import JSZip from 'jszip';
import logdown from 'logdown';
import {promises as fs, Stats as fsStats} from 'node:fs';
import path from 'node:path';
import progress from 'progress';

import {FileService} from './FileService.js';
import {Entry, TerminalOptions} from './interfaces.js';

export class BuildService {
  public compressedFilesCount: number;
  public outputFile: null | string;
  private entries: Entry[];
  private readonly fileService: FileService;
  private readonly ignoreEntries: RegExp[];
  private readonly jszip: JSZip;
  private readonly logger: logdown.Logger;
  private readonly options: Required<TerminalOptions>;
  private readonly progressBar: progress;

  constructor(options: Required<TerminalOptions>) {
    this.fileService = new FileService(options);
    this.jszip = new JSZip();
    this.options = options;
    this.logger = logdown('jszip-cli/BuildService', {
      logger: console,
      markdown: false,
    });
    this.logger.state = {isEnabled: options.verbose};
    this.entries = [];
    this.ignoreEntries = this.options.ignoreEntries.map(entry =>
      entry instanceof RegExp ? entry : new RegExp(entry.replace(/\*/g, '.*'))
    );
    this.outputFile = this.options.outputEntry ? path.resolve(this.options.outputEntry) : null;
    this.progressBar = new progress('Compressing [:bar] :percent :elapseds', {
      complete: '=',
      incomplete: ' ',
      total: 100,
      width: 20,
    });
    this.compressedFilesCount = 0;
  }

  public async add(rawEntries: string[]): Promise<BuildService> {
    this.logger.info(`Adding ${rawEntries.length} entr${rawEntries.length === 1 ? 'y' : 'ies'} to ZIP file.`);
    const normalizedEntries = this.normalizePaths(rawEntries);
    this.entries = [];
    for (const rawEntry of await glob(normalizedEntries)) {
      const resolvedPath = path.resolve(rawEntry);
      const baseName = path.basename(rawEntry);
      this.entries.push({
        resolvedPath,
        zipPath: baseName,
      });
    }
    return this;
  }

  public async save(): Promise<BuildService> {
    await this.checkOutput();

    await Promise.all(this.entries.map(entry => this.checkEntry(entry)));
    const data = await this.getBuffer();

    if (this.outputFile) {
      if (!this.outputFile.match(/\.\w+$/)) {
        this.outputFile = path.join(this.outputFile, 'data.zip');
      }

      this.logger.info(`Saving finished zip file to "${this.outputFile}" ...`);
      await this.fileService.writeFile(data, this.outputFile);
    } else {
      process.stdout.write(data);
    }

    return this;
  }

  private async addFile(entry: Entry, isLink = false): Promise<void> {
    const {resolvedPath, zipPath} = entry;
    let fileStat: fsStats;
    let fileData: Buffer | string;

    try {
      fileData = isLink ? await fs.readlink(resolvedPath) : await fs.readFile(resolvedPath);
      fileStat = await fs.lstat(resolvedPath);
    } catch (error) {
      if (!this.options.quiet) {
        this.logger.info(`Can't read file "${entry.resolvedPath}". Ignoring.`);
      }
      this.logger.info(error);
      return;
    }

    this.logger.info(`Adding file "${resolvedPath}" to ZIP file ...`);

    this.jszip.file(zipPath, fileData, {
      createFolders: true,
      date: fileStat.mtime,
      // See https://github.com/Stuk/jszip/issues/550
      // dosPermissions: fileStat.mode,
      unixPermissions: fileStat.mode,
    });

    this.compressedFilesCount++;
  }

  private async addLink(entry: Entry): Promise<void> {
    const {resolvedPath, zipPath} = entry;

    if (this.options.dereferenceLinks) {
      let realPath: string;
      try {
        realPath = await fs.realpath(resolvedPath);
      } catch (error) {
        if (!this.options.quiet) {
          this.logger.info(`Can't read link "${entry.resolvedPath}". Ignoring.`);
        }
        this.logger.info(error);
        return;
      }
      this.logger.info(`Found real path "${realPath} for symbolic link".`);
      await this.checkEntry({
        resolvedPath: realPath,
        zipPath,
      });
    } else {
      await this.addFile(entry, true);
    }
  }

  private async checkEntry(entry: Entry): Promise<void> {
    let fileStat: fsStats;
    try {
      fileStat = await fs.lstat(entry.resolvedPath);
    } catch (error) {
      if (!this.options.quiet) {
        this.logger.info(`Can't read file "${entry.resolvedPath}". Ignoring.`);
      }
      this.logger.info(error);
      return;
    }

    const ignoreEntries = this.ignoreEntries.filter(ignoreEntry => Boolean(entry.resolvedPath.match(ignoreEntry)));

    if (ignoreEntries.length) {
      this.logger.info(
        `Found ${entry.resolvedPath}. Not adding since it's on the ignore list:`,
        ignoreEntries.map(entry => String(entry))
      );
      return;
    }

    if (fileStat.isDirectory()) {
      this.logger.info(`Found directory "${entry.resolvedPath}".`);
      await this.walkDir(entry);
    } else if (fileStat.isFile()) {
      this.logger.info(`Found file "${entry.resolvedPath}".`);
      this.logger.info(`Found file "${entry.resolvedPath}".`);
      await this.addFile(entry);
    } else if (fileStat.isSymbolicLink()) {
      this.logger.info(`Found symbolic link "${entry.resolvedPath}".`);
      await this.addLink(entry);
    } else {
      this.logger.info('Unknown file type.', {fileStat});
      if (!this.options.quiet) {
        this.logger.info(`Can't read file "${entry.resolvedPath}". Ignoring.`);
      }
    }
  }

  private async checkOutput(): Promise<void> {
    if (this.outputFile) {
      if (this.outputFile.match(/\.\w+$/)) {
        const dirExists = await this.fileService.dirExists(path.dirname(this.outputFile));

        if (!dirExists) {
          throw new Error(`Directory "${path.dirname(this.outputFile)}" doesn't exist or is not writable.`);
        }

        const fileIsWritable = await this.fileService.fileIsWritable(this.outputFile);
        if (!fileIsWritable) {
          throw new Error(`File "${this.outputFile}" already exists.`);
        }
      } else {
        const dirExists = await this.fileService.dirExists(this.outputFile);

        if (!dirExists) {
          throw new Error(`Directory "${this.outputFile}" doesn't exist or is not writable.`);
        }
      }
    }
  }

  private getBuffer(): Promise<Buffer> {
    const compressionType = this.options.compressionLevel === 0 ? 'STORE' : 'DEFLATE';
    let lastPercent = 0;

    return this.jszip.generateAsync(
      {
        compression: compressionType,
        compressionOptions: {
          level: this.options.compressionLevel,
        },
        type: 'nodebuffer',
      },
      ({percent}) => {
        const diff = Math.floor(percent) - Math.floor(lastPercent);
        if (diff && !this.options.quiet) {
          this.progressBar.tick(diff);
          lastPercent = Math.floor(percent);
        }
      }
    );
  }

  /**
   * Note: glob patterns should always use / as a path separator, even on Windows systems,
   * as \ is used to escape glob characters.
   * https://github.com/isaacs/node-glob
   */
  private normalizePaths(rawEntries: string[]): string[] {
    return rawEntries.map(entry => entry.replace(/\\/g, '/'));
  }

  private async walkDir(entry: Entry): Promise<void> {
    this.logger.info(`Walking directory ${entry.resolvedPath} ...`);
    const dirEntries = await fs.readdir(entry.resolvedPath);
    for (const dirEntry of dirEntries) {
      const newZipPath = entry.zipPath === '.' ? dirEntry : `${entry.zipPath}/${dirEntry}`;
      const newResolvedPath = path.join(entry.resolvedPath, dirEntry);
      await this.checkEntry({
        resolvedPath: newResolvedPath,
        zipPath: newZipPath,
      });
    }
  }
}

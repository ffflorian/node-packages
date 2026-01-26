import chalk from 'chalk';
import {table as createTable} from 'table';
import logdown from 'logdown';
import semver from 'semver';

import {FileService} from './FileService.js';
import type {Options, RawDeps, RawReleaseInfo} from './interfaces.js';

const defaultOptions: Required<Options> = {
  debug: false,
  electronPrereleases: true,
  forceUpdate: false,
  latest: false,
  limit: 0,
  releasesUrl: 'https://releases.electronjs.org/releases.json',
  tempDirectory: '',
  timeout: 2000,
};

export const SupportedDependencies: RawDeps = {
  chrome: 'Chrome',
  modules: 'Modules (Node ABI)',
  node: 'Node.js',
  openssl: 'OpenSSL',
  uv: 'uv',
  v8: 'V8',
  zlib: 'zlib',
};

export class ElectronInfo {
  private readonly fileService: FileService;
  private readonly logger: logdown.Logger;
  private readonly options: Required<Options>;

  constructor(options?: Options) {
    this.options = {...defaultOptions, ...options};
    this.options.limit = Math.max(0, this.options.limit);
    this.logger = logdown('electron-info/ElectronInfo', {
      logger: console,
      markdown: false,
    });
    if (this.options.debug) {
      this.logger.state.isEnabled = true;
    }
    this.fileService = new FileService(this.options);
    this.logger.log('Initialized', this.options);
    console.log({limit: this.options.limit});
  }

  async getAllReleases(formatted: true, colored?: boolean): Promise<string>;
  async getAllReleases(formatted?: false): Promise<RawReleaseInfo[]>;
  async getAllReleases(formatted?: boolean, colored?: boolean): Promise<RawReleaseInfo[] | string> {
    this.logger.log('Getting all releases:', {colored, formatted});
    const allReleases = await this.fileService.getReleases();
    const limitedReleases = this.limitReleases(allReleases);
    return formatted ? this.formatReleases(limitedReleases, colored) : limitedReleases;
  }

  async getDependencyReleases(dependency: keyof RawDeps, version: string, formatted?: false): Promise<RawReleaseInfo[]>;
  async getDependencyReleases(
    dependency: keyof RawDeps,
    version: string,
    formatted: true,
    colored?: boolean
  ): Promise<RawReleaseInfo[] | string>;
  async getDependencyReleases(
    dependency: keyof RawDeps,
    version: string,
    formatted?: boolean,
    colored?: boolean
  ): Promise<RawReleaseInfo[] | string> {
    this.logger.log('Getting dependency releases:', {colored, dependency, formatted, version});
    const allReleases = await this.fileService.getReleases();
    const dependencyVersions = await this.getVersions(allReleases, dependency, version);
    const filteredReleases = allReleases.filter(release => dependencyVersions.includes(release[dependency]));

    const limitedReleases = this.limitReleases(filteredReleases);
    return formatted ? this.formatDependencyReleases(limitedReleases, colored) : limitedReleases;
  }

  async getElectronReleases(version: string, formatted: true, colored?: boolean): Promise<string>;
  async getElectronReleases(version: string, formatted?: false): Promise<RawReleaseInfo[]>;
  async getElectronReleases(
    version: string,
    formatted?: boolean,
    colored?: boolean
  ): Promise<RawReleaseInfo[] | string> {
    this.logger.log('Getting Electron releases:', {colored, formatted, version});

    const allReleases = await this.fileService.getReleases();
    const electronVersions = await this.getVersions(allReleases, 'electron', version);
    const filteredReleases = allReleases.filter(release => electronVersions.includes(release.version));

    const limitedReleases = this.limitReleases(filteredReleases);
    return formatted ? this.formatReleases(limitedReleases, colored) : limitedReleases;
  }

  private buildFoundString(releases: RawReleaseInfo[]): string {
    this.logger.log('Building found string:', {releasesLength: releases.length});
    return `Found ${releases.length} release${releases.length === 1 ? '' : 's'}.`;
  }

  private buildRawTables(releases: RawReleaseInfo[], colored?: boolean): string[][][] {
    this.logger.log('Building raw tables:', {colored, releasesLength: releases.length});
    const coloredOrNot = (text: string, style: typeof chalk): string => (colored ? style(text) : text);

    return releases.map(release => {
      const table = [
        [coloredOrNot('Electron', chalk.bold), release.version],
        [coloredOrNot('Published on', chalk.bold), release.date],
      ];

      table.push(
        [coloredOrNot(SupportedDependencies.node, chalk.bold.red), release.node],
        [coloredOrNot(SupportedDependencies.chrome, chalk.bold.green), release.chrome],
        [coloredOrNot(SupportedDependencies.openssl, chalk.bold.blue), release.openssl],
        [coloredOrNot(SupportedDependencies.modules, chalk.bold.yellow), release.modules],
        [coloredOrNot(SupportedDependencies.uv, chalk.bold.cyan), release.uv],
        // eslint-disable-next-line no-magic-numbers
        [coloredOrNot(SupportedDependencies.v8, chalk.bold.rgb(150, 150, 150)), release.v8],
        [coloredOrNot(SupportedDependencies.zlib, chalk.bold.magenta), release.zlib]
      );

      return table;
    });
  }

  private formatDependencyReleases(releases: RawReleaseInfo[], colored?: boolean): string {
    this.logger.log('Formatting dependency releases:', {colored, releasesLength: releases.length});

    if (!releases.length) {
      return this.buildFoundString(releases);
    }

    const joinedReleases = this.buildRawTables(releases, colored)
      .map(table => createTable(table))
      .join('\n');

    return `${joinedReleases}\n${this.buildFoundString(releases)}`;
  }

  private formatReleases(releases: RawReleaseInfo[], colored?: boolean): string {
    this.logger.log('Formatting releases:', {colored, releasesLength: releases.length});
    if (!releases.length) {
      return this.buildFoundString(releases);
    }

    const joinedReleases = this.buildRawTables(releases, colored)
      .map(table => createTable(table))
      .join('\n');

    return `${joinedReleases}\n${this.buildFoundString(releases)}`;
  }

  private async getVersions(
    releases: RawReleaseInfo[],
    key: 'electron' | keyof RawDeps,
    inputVersion: string
  ): Promise<string[]> {
    this.logger.log('Getting versions:', {inputVersion, key});
    const satisfiesVersion = (dependencyVersion: string, inputVersion: string) => {
      const dependencyVersionClean = semver.clean(dependencyVersion, {loose: true}) || '';
      return semver.satisfies(dependencyVersionClean, inputVersion, {
        includePrerelease: true,
        loose: true,
      });
    };

    let dependencyVersions: string[] = [];

    if (!this.options.electronPrereleases) {
      const tempReleaseNumber = releases.length;
      releases = releases.filter(release => semver.prerelease(release.version) === null);
      this.logger.log('Removing electron prereleases from found versions', {
        after: releases.length,
        before: tempReleaseNumber,
      });
    }

    dependencyVersions = releases
      .filter(release => {
        if (key !== 'electron' && !release[key]) {
          return false;
        }

        if (inputVersion === 'all') {
          return true;
        }

        return key === 'electron'
          ? satisfiesVersion(release.version, inputVersion)
          : satisfiesVersion(release[key], inputVersion);
      })
      .map(release => (key === 'electron' ? release.version : release[key]));

    return dependencyVersions;
  }

  private limitReleases(releases: RawReleaseInfo[]): RawReleaseInfo[] {
    const limit = this.options.limit || (this.options.latest ? 1 : undefined);
    if (limit) {
      const slicedArray = releases.slice(0, limit);
      this.logger.log('Limiting found versions', {
        after: slicedArray.length,
        before: releases.length,
        limit,
      });
      return slicedArray;
    }
    return releases;
  }
}

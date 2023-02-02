import {Chalk, bold as chalkBold} from 'chalk';
import {format as formatDate} from 'date-fns';
import {table as createTable} from 'table';
import logdown from 'logdown';
import * as semver from 'semver';

import {FileService} from './FileService';

export interface RawDeps {
  chrome: string;
  modules: string;
  node: string;
  openssl: string;
  uv: string;
  v8: string;
  zlib: string;
}

export interface RawReleaseInfo {
  deps?: RawDeps;
  name: string;
  node_id: string;
  npm_dist_tags: string[];
  npm_package_name?: string;
  prerelease: boolean;
  published_at: string;
  tag_name: string;
  total_downloads: number;
  version: string;
}

export interface Options {
  /** Enable debug logging. Default: `false`. */
  debug?: boolean;
  /** If Electron prereleases should be included. Default: `true`. */
  electronPrereleases?: boolean;
  /** Force downloading the latest release file. Default: `false`. */
  forceUpdate?: boolean;
  /**
   * Include only the latest release. Alias for `limit=1`. Ignores `limit`.
   * Default: `false`.
   */
  latest?: boolean;
  /**
   * Limit output of releases. Everything below 1 will be treated as no limit.
   * Default: 0.
   */
  limit?: number;
  /**
   * Can be a URL or a local path. Default:
   * https://raw.githubusercontent.com/electron/releases/master/lite.json.
   */
  releasesUrl?: string;
  /**
   * Use a custom temporary directory. If not defined, the system's temporary
   * directory will be used.
   */
  tempDirectory?: string;
  /** Use a custom HTTP timeout in milliseconds. Default is `2000`. */
  timeout?: number;
}

const defaultOptions: Required<Options> = {
  debug: false,
  electronPrereleases: true,
  forceUpdate: false,
  latest: false,
  limit: 0,
  releasesUrl: 'https://raw.githubusercontent.com/electron/releases/master/lite.json',
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
    const filteredReleases = allReleases.filter(
      release => release.deps && dependencyVersions.includes(release.deps[dependency])
    );

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
    const coloredOrNot = (text: string, style: Chalk): string => (colored ? style(text) : text);

    return releases.map(release => {
      const electronVersion = `${release.version}${release.prerelease ? ' (prerelease)' : ''}`;
      const parsedDate = new Date(release.published_at);
      const releaseDate = formatDate(parsedDate, 'yyyy-MM-dd');
      const table = [
        [coloredOrNot('Electron', chalkBold), electronVersion],
        [coloredOrNot('Published on', chalkBold), releaseDate],
      ];

      if (release.deps) {
        table.push(
          [coloredOrNot(SupportedDependencies.node, chalkBold.red), release.deps.node],
          [coloredOrNot(SupportedDependencies.chrome, chalkBold.green), release.deps.chrome],
          [coloredOrNot(SupportedDependencies.openssl, chalkBold.blue), release.deps.openssl],
          [coloredOrNot(SupportedDependencies.modules, chalkBold.yellow), release.deps.modules],
          [coloredOrNot(SupportedDependencies.uv, chalkBold.cyan), release.deps.uv],
          // eslint-disable-next-line no-magic-numbers
          [coloredOrNot(SupportedDependencies.v8, chalkBold.rgb(150, 150, 150)), release.deps.v8],
          [coloredOrNot(SupportedDependencies.zlib, chalkBold.magenta), release.deps.zlib]
        );
      }

      return table;
    });
  }

  private formatDependencyReleases(releases: RawReleaseInfo[], colored?: boolean): string {
    this.logger.log('Formatting dependency releases:', {colored, releasesLength: releases.length});
    releases = releases.filter(release => !!release.deps);

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
        if (key !== 'electron' && !Boolean(release.deps)) {
          return false;
        }

        if (inputVersion === 'all') {
          return true;
        }

        if (key === 'electron' && release.npm_dist_tags && release.npm_dist_tags.includes(inputVersion)) {
          return true;
        }

        return key === 'electron'
          ? satisfiesVersion(release.version, inputVersion)
          : satisfiesVersion(release.deps![key], inputVersion);
      })
      .map(release => (key === 'electron' ? release.version : release.deps![key]));

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

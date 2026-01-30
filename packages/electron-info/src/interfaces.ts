export type HTTPOptions = Pick<Options, 'debug' | 'timeout'>;

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

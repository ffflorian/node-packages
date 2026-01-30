export interface ConfigFileOptions extends TerminalOptions {
  /** Which files or directories to add. */
  entries: string[];
  /** Add or extract files. */
  mode: 'add' | 'extract';
}

export interface Entry {
  resolvedPath: string;
  zipPath: string;
}

export interface TerminalOptions {
  /** The compression level to use (0 = save only, 9 = best compression) (default: 5). */
  compressionLevel?: number;
  /** Use a configuration file (default: .jsziprc.json). */
  configFile?: boolean | string;
  /** Whether to dereference (follow) symlinks (default: false). */
  dereferenceLinks?: boolean;
  /** Force overwriting files and directories when extracting (default: false). */
  force?: boolean;
  /** Ignore entries (e.g. `*.js.map`). */
  ignoreEntries?: Array<RegExp | string>;
  /** Set the output directory (default: stdout). */
  outputEntry?: null | string;
  /** Don't log anything excluding errors (default: false). */
  quiet?: boolean;
  /** Enable verbose logging (default: false). */
  verbose?: boolean;
}

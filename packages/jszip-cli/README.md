# jszip-cli [![npm version](https://img.shields.io/npm/v/@ffflorian/jszip-cli.svg?style=flat)](https://www.npmjs.com/package/@ffflorian/jszip-cli)

A zip CLI based on [jszip](https://www.npmjs.com/package/jszip).

## Installation

Run `yarn global add @ffflorian/jszip-cli` or `npm i -g @ffflorian/jszip-cli`.

Or simply run `npx @ffflorian/jszip-cli`.

## Usage

### CLI

```
Usage: jszip-cli [options] [command]

A zip CLI based on jszip.

Options:

  --noconfig                         don't look for a configuration file
  -c, --config <path>                use a configuration file (default: .jsziprc.json)
  -o, --output <dir>                 set the output directory (default: stdout)
  -i, --ignore <entry>               ignore a file or directory
  -f, --force                        force overwriting files and directories when extracting (default: false)
  -d, --dereference                  dereference (follow) links (default: false)
  -l, --level <number>               set the compression level (default: 5)
  -V, --verbose                      enable verbose logging (default: false)
  -q, --quiet                        don't log anything (default: false)
  -v, --version                      output the version number
  -h, --help                         output usage information

Commands:

  add|a [options] [entries...]       add files and directories to a new ZIP archive
  extract|e [options] <archives...>  extract files and directories from ZIP archive(s)
```

### Configuration file

To use a configuration file, add a configuration file following the [cosmiconfig standard](https://github.com/davidtheclark/cosmiconfig#cosmiconfig) (e.g. `.jsziprc.json`) to your project and the JSZip CLI will find it automatically. Options from the CLI still take precedence over the configuration file.

The structure of the configuration file is the following:

```ts
{
  /** The compression level to use (0 = save only, 9 = best compression) (default: 5). */
  compressionLevel?: number;

  /** Use a configuration file (default: .jsziprc.json). */
  configFile?: string | boolean;

  /** Whether to dereference (follow) symlinks (default: false). */
  dereferenceLinks?: boolean;

  /** Which files or directories to add. */
  entries: string[];

  /** Force overwriting files and directories when extracting (default: false). */
  force?: boolean;

  /** Ignore entries (e.g. `*.js.map`). */
  ignoreEntries?: Array<string | RegExp>;

  /** Add or extract files. */
  mode: 'add' | 'extract';

  /** Set the output directory (default: stdout). */
  outputEntry?: string | null;

  /** Don't log anything excluding errors (default: false). */
  quiet?: boolean;

  /** Enable verbose logging (default: false). */
  verbose?: boolean;
}
```

If you would like to use a custom configuration file, start the CLI with the option `--config <file>`.

## Examples

### CLI examples

```
jszip-cli add --ignore *.map --output deploy.zip dist/ package.json

jszip-cli add --ignore *.map dist/ package.json > deploy.zip

jszip-cli extract --output deployment_files/ deploy.zip
```

### Configuration file examples

- [JSON configuration example](./config-examples/.jsziprc.example.json)
- [JavaScript configuration example](./config-examples/.jsziprc.example.js)

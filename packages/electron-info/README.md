![electron-info](./electron-info-icon.png)

# electron-info [![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0) [![npm version](https://img.shields.io/npm/v/electron-info.svg?style=flat)](https://www.npmjs.com/package/electron-info)

Get useful data about Electron releases. Uses [electron-releases](https://github.com/electron/releases) in the background.

## Prerequisites

- [Node.js](https://nodejs.org)
- npm (preinstalled) or [yarn](https://yarnpkg.com)

## Installation

ℹ️ This is a pure [ESM](https://nodejs.org/api/esm.html#introduction) module.

Just run `npx electron-info`.

If you'd like to install it permanently, run `yarn global add electron-info` or `npm i -g electron-info`.

## CLI Usage

```
Usage: electron-info [options] [command]

Get useful data about Electron releases.

Allowed version argument inputs:
  - SemVer versions (e.g. "~7")
  - npm dist tags (e.g. "5-0-x", only Electron)
  - "all"

Options:
  -d, --debug             enable debug logging
  -f, --force             force downloading the latest release file
  -L, --latest            list only the latest release (alias for --limit 1,
                          ignores limit)
  -l, --limit <number>    limit output of releases
  -r, --raw               output raw JSON
  -s, --source <url>      use a custom releases source URL or path
  -t, --timeout <number>  use a custom HTTP timeout
  -v, --version           output the version number
  --no-colors             don't use colors for displaying
  --no-prereleases        don't include Electron prereleases
  -h, --help              display help for command

Commands:
  electron|e [version]    show data for Electron releases
  chrome|c [version]      show data for Chrome releases
  modules|m [version]     show data for Modules (Node ABI) releases
  node|n [version]        show data for Node.js releases
  openssl|o [version]     show data for OpenSSL releases
  uv|u [version]          show data for uv releases
  v8|v [version]          show data for V8 releases
  zlib|z [version]        show data for zlib releases
  all|a                   show data for all kinds of releases
  help [command]          display help for command
```

### Examples

```shell
$ electron-info electron 4
╔════════════════════╤═══════════════════════╗
║ Electron           │ 4.2.12                ║
╟────────────────────┼───────────────────────╢
║ Published on       │ 2019-10-16            ║
╟────────────────────┼───────────────────────╢
║ Node.js            │ 10.11.0               ║
╟────────────────────┼───────────────────────╢
║ Chrome             │ 69.0.3497.128         ║
╟────────────────────┼───────────────────────╢
║ OpenSSL            │ 1.1.0                 ║
╟────────────────────┼───────────────────────╢
║ Modules (Node ABI) │ 69                    ║
╟────────────────────┼───────────────────────╢
║ uv                 │ 1.23.0                ║
╟────────────────────┼───────────────────────╢
║ V8                 │ 6.9.427.31-electron.0 ║
╟────────────────────┼───────────────────────╢
║ zlib               │ 1.2.11                ║
╚════════════════════╧═══════════════════════╝

╔════════════════════╤═══════════════════════╗
║ Electron           │ 4.2.11                ║
╟────────────────────┼───────────────────────╢
║ Published on       │ 2019-09-24            ║
╟────────────────────┼───────────────────────╢
║ Node.js            │ 10.11.0               ║
╟────────────────────┼───────────────────────╢
║ Chrome             │ 69.0.3497.128         ║
╟────────────────────┼───────────────────────╢
║ OpenSSL            │ 1.1.0                 ║
╟────────────────────┼───────────────────────╢
║ Modules (Node ABI) │ 69                    ║
╟────────────────────┼───────────────────────╢
║ uv                 │ 1.23.0                ║
╟────────────────────┼───────────────────────╢
║ V8                 │ 6.9.427.31-electron.0 ║
╟────────────────────┼───────────────────────╢
║ zlib               │ 1.2.11                ║
╚════════════════════╧═══════════════════════╝

[...]

Found 42 releases.
```

```shell
$ electron-info chrome 71
╔════════════════════╤═════════════════════════════════════╗
║ Electron           │ 5.0.0-nightly.20190122 (prerelease) ║
╟────────────────────┼─────────────────────────────────────╢
║ Published on       │ 2019-01-22                          ║
╟────────────────────┼─────────────────────────────────────╢
║ Node.js            │ 12.0.0                              ║
╟────────────────────┼─────────────────────────────────────╢
║ Chrome             │ 71.0.3578.98                        ║
╟────────────────────┼─────────────────────────────────────╢
║ OpenSSL            │ 1.1.0                               ║
╟────────────────────┼─────────────────────────────────────╢
║ Modules (Node ABI) │ 68                                  ║
╟────────────────────┼─────────────────────────────────────╢
║ uv                 │ 1.24.1                              ║
╟────────────────────┼─────────────────────────────────────╢
║ V8                 │ 7.1.302.31-electron.0               ║
╟────────────────────┼─────────────────────────────────────╢
║ zlib               │ 1.2.11                              ║
╚════════════════════╧═════════════════════════════════════╝

╔════════════════════╤═════════════════════════════════════╗
║ Electron           │ 5.0.0-nightly.20190121 (prerelease) ║
╟────────────────────┼─────────────────────────────────────╢
║ Published on       │ 2019-01-22                          ║
╟────────────────────┼─────────────────────────────────────╢
║ Node.js            │ 12.0.0                              ║
╟────────────────────┼─────────────────────────────────────╢
║ Chrome             │ 71.0.3578.98                        ║
╟────────────────────┼─────────────────────────────────────╢
║ OpenSSL            │ 1.1.0                               ║
╟────────────────────┼─────────────────────────────────────╢
║ Modules (Node ABI) │ 68                                  ║
╟────────────────────┼─────────────────────────────────────╢
║ uv                 │ 1.24.1                              ║
╟────────────────────┼─────────────────────────────────────╢
║ V8                 │ 7.1.302.31-electron.0               ║
╟────────────────────┼─────────────────────────────────────╢
║ zlib               │ 1.2.11                              ║
╚════════════════════╧═════════════════════════════════════╝

Found 2 releases.

```

## TypeScript Usage

- [see definitions](src/interfaces.ts)
- [see CLI](./src/cli.ts)

# crates-updater [![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0) [![npm version](https://img.shields.io/npm/v/crates-updater.svg?style=flat)](https://www.npmjs.com/package/crates-updater)

Check your [Rust packages](https://crates.io) for updates.

## Prerequisites

- [Node.js](https://nodejs.org) >= 14
- npm (preinstalled) or [yarn](https://classic.yarnpkg.com)

## Installation

ℹ️ This is a hybrid [CommonJS](https://nodejs.org/docs/latest/api/modules.html#modules-commonjs-modules) / [ESM](https://nodejs.org/api/esm.html#introduction) module.

Run `yarn global add crates-updater` or `npm i -g crates-updater`.

## Usage

```
Usage: crates-updater [options] <package> [packageVersion]

Check your Rust packages for updates.

Options:
  -q, --quiet    quiet mode. Display newer version or nothing
  -v, --version  output the version number
  -h, --help     output usage information
```

## Examples

```shell
# returns either a newer version or nothing
crates-updater ripgrep -q 0.9.0

# returns the latest version with a helpful text
crates-updater ripgrep
```

## API Usage

See [`cli.ts`](./src/cli.ts).

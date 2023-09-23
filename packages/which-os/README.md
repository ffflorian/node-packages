# which-os [![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0) [![npm version](https://img.shields.io/npm/v/which-os.svg?style=flat)](https://www.npmjs.com/package/which-os)

Get informations about your OS.

## Prerequisites

- [Node.js](https://nodejs.org) >= 14
- npm (preinstalled) or [yarn](https://classic.yarnpkg.com)

## Installation

ℹ️ This is a hybrid [CommonJS](https://nodejs.org/docs/latest/api/modules.html#modules-commonjs-modules) / [ESM](https://nodejs.org/api/esm.html#introduction) module.

Run `yarn add which-os` or `npm i which-os`.

Or simply run `npx which-os`.

## Usage

```
Usage: which-os [options]

Get informations about your OS

Options:
  --is-linux     Is the operating system Linux?
  --is-macos     Is the operating system macOS?
  --is-windows   Is the operating system Windows?
  --is-x64       Is the processor architecture x64?
  --is-ia32      Is the processor architecture ia32?
  --is-arm       Is the processor architecture ARM?
  -i, --os-info  Output all OS informations
  -V, --verbose  Enable verbose output
  -v, --version  output the version number
  -h, --help     output usage information
```

## TypeScript Usage

See [`./src/cli.ts`](./src/cli.ts)

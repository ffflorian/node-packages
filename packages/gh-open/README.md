# gh-open [![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0) [![npm version](https://img.shields.io/npm/v/@ffflorian/gh-open.svg?style=flat)](https://www.npmjs.com/package/@ffflorian/gh-open)

Open a GitHub repository in your browser.

## Prerequisites

- [Node.js](https://nodejs.org)
- npm (preinstalled) or [yarn](https://yarnpkg.com)

## Installation

ℹ️ This is a pure [ESM](https://nodejs.org/api/esm.html#introduction) module.

Run `yarn global add @ffflorian/gh-open` or `npm install -g @ffflorian/gh-open`.

## Usage

```
Usage: gh-open [options] [directory]

Open a GitHub repository in your browser. Opens pull requests by default.

Options:
  -d, --debug             Enable debug logging
  -p, --print             Just print the URL
  -b, --branch            Open the branch tree (and not the PR)
  -t, --timeout <number>  Set a custom timeout for HTTP requests
  -v, --version           output the version number
  -h, --help              display help for command
```

## Test

```
yarn
yarn test
```

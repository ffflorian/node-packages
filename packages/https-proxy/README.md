# https-proxy [![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0) [![npm version](https://img.shields.io/npm/v/@ffflorian/https-proxy.svg?style=flat)](https://www.npmjs.com/package/@ffflorian/https-proxy)

A simple HTTPS proxy for Node.js with authentication support.

## Prerequisites

- [Node.js](https://nodejs.org) >= 14
- npm (preinstalled) or [yarn](https://classic.yarnpkg.com)

## Installation

ℹ️ This is a hybrid [CommonJS](https://nodejs.org/docs/latest/api/modules.html#modules-commonjs-modules) / [ESM](https://nodejs.org/api/esm.html#introduction) module.

Run `yarn global add @ffflorian/https-proxy` or `npm install -g @ffflorian/https-proxy`.

## Usage

```
Usage: https-proxy [options]

A simple HTTPS proxy for Node.js with authentication support.
If password and username are not set, no authentication will be required.

Options:
  -p, --password <password>  set the password
  -P, --port <port>          set the port (default: 8080)
  -t, --target <url>         set the target URL to forward users to
  -u, --username <username>  set the username
  -v, --version              output the version number
  -h, --help                 output usage information
```

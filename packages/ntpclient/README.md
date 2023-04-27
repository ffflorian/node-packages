# NTPClient [![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0) [![npm version](https://img.shields.io/npm/v/ntpclient.svg?style=flat)](https://www.npmjs.com/package/ntpclient)

TypeScript implementation of the NTP Client Protocol. Based on [node-ntp-client](https://github.com/moonpyk/node-ntp-client).

## Prerequisites

- [Node.js](https://nodejs.org) >= 14
- npm (preinstalled) or [yarn](https://classic.yarnpkg.com) < 2

## Installation

ℹ️ This is a hybrid [CommonJS](https://nodejs.org/docs/latest/api/modules.html#modules-commonjs-modules) / [ESM](https://nodejs.org/api/esm.html#introduction) module.

Run `yarn add ntpclient` or `npm i ntpclient`.

```ts
import {NTPClient} from 'ntpclient';

new NTPClient()
  .getNetworkTime()
  .then(date => console.log(date)) // 2017-09-20T15:29:09.443Z
  .catch(err => console.error(err));

// or

new NTPClient({
  server: 'de.pool.ntp.org',
  port: 123,
  replyTimeout: 40 * 1000, // 40 seconds
})
  .getNetworkTime()
  .then(date => console.log(date)) // 2017-09-20T15:29:09.443Z
  .catch(err => console.error(err));

// or

new NTPClient('de.pool.ntp.org', 123, 40 * 1000)
  .getNetworkTime()
  .then(date => console.log(date)) // 2017-09-20T15:29:09.443Z
  .catch(err => console.error(err));
```

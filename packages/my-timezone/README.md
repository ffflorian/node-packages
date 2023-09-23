# my-timezone [![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0) [![npm version](https://img.shields.io/npm/v/my-timezone.svg?style=flat)](https://www.npmjs.com/package/my-timezone)

Get the exact time based on your location by calculating the time difference in seconds from UTC (good explanation on [CS4FN](http://www.cs4fn.org/mobile/owntimezone.php)).

## Prerequisites

- [Node.js](https://nodejs.org) >= 14
- npm (preinstalled) or [yarn](https://classic.yarnpkg.com)

## Installation

ℹ️ This is a hybrid [CommonJS](https://nodejs.org/docs/latest/api/modules.html#modules-commonjs-modules) / [ESM](https://nodejs.org/api/esm.html#introduction) module.

Add the module to your project with `yarn add my-timezone` or install it globally with `yarn global add my-timezone`.

## Usage

### TypeScript

```ts
import {MyTimezone} from 'my-timezone';

new MyTimezone()
  .getTimeByAddress('Berlin, Germany')
  .then(date => {
    console.log(date.toString()); // Sun Sep 03 2017 14:29:49 GMT+0200
  })
  .catch(error => console.error(error));

// or

new MyTimezone()
  .getTimeByLocation('13.394')
  .then(date => {
    console.log(date.toString()); // Sun Sep 03 2017 14:29:49 GMT+0200
  })
  .catch(error => console.error(error));
```

### CLI

```
Usage: my-timezone [options] <location>

Get the exact time based on your location.
Use a city name or longitude value as location.

Options:

  -V, --version  output the version number
  -o, --offline  Work offline (default is false)
  -s, --server   Specify the NTP server (default is "pool.ntp.org")
  -h, --help     output usage information
```

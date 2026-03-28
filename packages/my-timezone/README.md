# my-timezone [![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0) [![npm version](https://img.shields.io/npm/v/my-timezone.svg?style=flat)](https://www.npmjs.com/package/my-timezone)

Calculate the true solar time at any geographic location based on its longitude.

This is **not** political timezone data (UTC+1, DST, etc.) — it is [local mean time](https://en.wikipedia.org/wiki/Solar_time#Mean_solar_time): the astronomically correct time at a given longitude, where every degree equals exactly 4 minutes of offset from UTC. See [CS4FN](http://www.cs4fn.org/mobile/owntimezone.php) for a good explanation of the underlying concept.

## Prerequisites

- [Node.js](https://nodejs.org)
- npm (preinstalled) or [yarn](https://yarnpkg.com)

## Installation

ℹ️ This is a pure [ESM](https://nodejs.org/api/esm.html#introduction) module.

Add the module to your project with `yarn add my-timezone` or install it globally with `yarn global add my-timezone`.

## Usage

### TypeScript

```ts
import {MyTimezone} from 'my-timezone';

new MyTimezone()
  .getDateByAddress('Berlin, Germany')
  .then(date => {
    console.log(date.toString()); // Sun Sep 03 2017 14:29:49 GMT+0200
  })
  .catch(error => console.error(error));

// or

new MyTimezone()
  .getDateByLongitude(13.394)
  .then(date => {
    console.log(date.toString()); // Sun Sep 03 2017 14:29:49 GMT+0200
  })
  .catch(error => console.error(error));
```

### CLI

```
Usage: my-timezone [options] <location>

Get the true solar time based on your location.
Use a city name or longitude value as location.

Options:

  -V, --version  output the version number
  -o, --offline  Work offline (default is false)
  -s, --server   Specify the NTP server (default is "pool.ntp.org")
  -h, --help     output usage information
```

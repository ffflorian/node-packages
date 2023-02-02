#!/usr/bin/env node

import {program as commander} from 'commander';
import * as fs from 'fs';
import * as path from 'path';

import {MyTimezone} from './MyTimezone';

const defaultPackageJsonPath = path.join(__dirname, 'package.json');
const packageJsonPath = fs.existsSync(defaultPackageJsonPath)
  ? defaultPackageJsonPath
  : path.join(__dirname, '../package.json');

const {bin, description, version} = require(packageJsonPath);

commander
  .name(Object.keys(bin)[0])
  .version(version)
  .description(`${description}\nUse a city name or longitude value as location.`)
  .option('-o, --offline', 'Work offline (default is false)')
  .option('-s, --server <server>', 'Specify the NTP server (default is "pool.ntp.org")')
  .argument('<location>')
  .parse(process.argv);

if (!commander.args || !commander.args.length) {
  console.error('Error: No location specified.');
  commander.help();
}

const location = commander.args[0];

const myTimezone = new MyTimezone({
  ntpServer: commander.opts().server,
  offline: !!commander.opts().offline,
});

void (async () => {
  try {
    const {longitude} = await myTimezone.getLocation(location);
    const date = await myTimezone.getDateByLongitude(longitude);
    const parsedDate = myTimezone.parseDate(date);
    const formattedDate = `${parsedDate.year}-${parsedDate.month}-${parsedDate.day}`;
    const formattedTime = `${parsedDate.hours}:${parsedDate.minutes}:${parsedDate.seconds}`;

    console.info(`Custom time zone in "${location}" (longitude: ${longitude}): ${formattedDate} ${formattedTime}`);
    process.exit();
  } catch (error) {
    console.error((error as Error).message);
    process.exit(1);
  }
})();

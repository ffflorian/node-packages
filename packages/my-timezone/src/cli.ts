#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {program as commander} from 'commander';

import {MyTimezone} from './MyTimezone.js';

interface PackageJson {
  bin: Record<string, string>;
  description: string;
  version: string;
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const packageJsonPath = path.join(__dirname, '../package.json');

const {bin, description, version}: PackageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

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

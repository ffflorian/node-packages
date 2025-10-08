#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import {program as commander} from 'commander';

import {NTPClient} from './index.js';

interface PackageJson {
  description: string;
  name: string;
  version: string;
}

const __dirname = import.meta.dirname;
const packageJsonPath = path.join(__dirname, '../package.json');

const {description, name, version}: PackageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

commander
  .name(name)
  .version(version)
  .description(description)
  .option('-s, --server <host>', 'Specify a custom NTP server')
  .option('-p, --port <number>', 'Specify a custom NTP port')
  .option('-t, --timeout <number>', 'Specify the timeout in milliseconds')
  .parse(process.argv);

const commanderOptions = commander.opts();

void (async () => {
  try {
    const date = await new NTPClient({
      ...(commanderOptions.server && {server: commanderOptions.server}),
      ...(commanderOptions.port && {port: commanderOptions.port}),
      ...(commanderOptions.timeout && {replyTimeout: commanderOptions.timeout}),
    }).getNetworkTime();

    console.info(date.toString());
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
})();

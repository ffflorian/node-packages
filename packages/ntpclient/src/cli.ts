#!/usr/bin/env node

import {program as commander} from 'commander';
import {createRequire} from 'node:module';
const require = createRequire(import.meta.url);

import {NTPClient} from './index.js';

interface PackageJson {
  bin: Record<string, string>;
  description: string;
  version: string;
}

const {bin, description, version}: PackageJson = require('../package.json');

commander
  .name(Object.keys(bin)[0])
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

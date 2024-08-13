#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {program as commander} from 'commander';

import {NTPClient} from './index.js';

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

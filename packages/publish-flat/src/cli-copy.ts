#!/usr/bin/env node

import fs from 'node:fs/promises';
import path from 'node:path';
import {program as commander} from 'commander';

import {copyJson} from './copyJson.js';

interface PackageJson {
  bin: Record<string, string>;
  version: string;
}

const __dirname = import.meta.dirname;
const packageJsonPath = path.join(__dirname, '../package.json');

const {bin, version}: PackageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf-8'));
const name = Object.keys(bin)[1];

commander
  .name(name)
  .version(version)
  .description(`Copy entries from one JSON file to the other (example: "${name} version")`)
  .option('-i, --input <file>', 'Set the input JSON file', './package.json')
  .option('-o, --output <file>', 'Set the output JSON file', '../package.json')
  .parse(process.argv);

const values = commander.args;
const commanderOptions = commander.opts();

if (!values.length) {
  console.error('No values to copy');
  commander.help();
}

copyJson(commanderOptions.input, commanderOptions.output, values).catch(error => {
  console.error(error);
  process.exit(1);
});

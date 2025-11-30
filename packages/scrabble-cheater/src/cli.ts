#!/usr/bin/env node

import fs from 'node:fs/promises';
import path from 'node:path';
import {program as commander} from 'commander';

import {Options, ScrabbleCheater} from './index.js';

interface PackageJson {
  description: string;
  name: string;
  version: string;
}

const __dirname = import.meta.dirname;
const packageJsonPath = path.join(__dirname, '../package.json');

const {description, name, version}: PackageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf-8'));

commander
  .name(name)
  .version(version)
  .description(description)
  .option('-w, --wordlist <file>', 'Specify a wordlist file (mandatory)')
  .option('-l, --letters <letters>', 'Specify letters')
  .option('-q, --quiet', 'Quiet mode: displays only the letters')
  .option('-m, --maximum <number>', 'Specify a maximum of results')
  .option('-s, --single', 'Single word mode: displays each word and copies it to the clipboard')
  .parse(process.argv);

const commanderOptions = commander.opts();

if (!commanderOptions.wordlist) {
  console.error('  Error: no wordlist file specified.');
  commander.help();
}

if (commanderOptions.maximum && !parseInt(commanderOptions.maximum, 10)) {
  console.error('  Error: invalid maximum number specified.');
  commander.help();
}

const options: Options = {
  ...(commanderOptions.letters && {letters: commanderOptions.letters}),
  ...(commanderOptions.maximum && {maximum: commanderOptions.maximum}),
  ...(commanderOptions.quiet && {quiet: commanderOptions.quiet}),
  ...(commanderOptions.single && {single: commanderOptions.single}),
};

void (async () => {
  try {
    const matches = await new ScrabbleCheater(commanderOptions.wordlist, options).start();
    if (matches.length && !commanderOptions.single) {
      console.info(matches.join('\n'));
    }
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
})();

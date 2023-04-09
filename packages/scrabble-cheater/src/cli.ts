#!/usr/bin/env node

import {program as commander} from 'commander';
import {createRequire} from 'node:module';
const require = createRequire(import.meta.url);

import {Options, ScrabbleCheater} from './index.js';

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

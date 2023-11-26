#!/usr/bin/env node

import {program as commander} from 'commander';
import {createRequire} from 'module';
const require = createRequire(import.meta.url);

import {IconGenerator} from './index.js';

interface PackageJson {
  bin: Record<string, string>;
  description: string;
  version: string;
}

const {bin, description, version}: PackageJson = require('../package.json');

commander
  .description(description)
  .name(Object.keys(bin)[0])
  .version(version)
  .option('-i, --input <file>', 'Input PNG file (recommended size: 1024x1024)', './icon.png')
  .option('-o, --output <folder>', 'Folder to output new icons folder', './')
  .option('-s, --silent', `Don't log anything beside errors`, false)
  .parse(process.argv);

const commanderOptions = commander.opts();

new IconGenerator({
  input: commanderOptions.input,
  output: commanderOptions.output,
  silent: commanderOptions.silent,
})
  .start()
  .then(() => process.exit())
  .catch(error => {
    console.error(error);
    process.exit(1);
  });

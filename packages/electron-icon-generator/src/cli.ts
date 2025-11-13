#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import {program as commander} from 'commander';

import {IconGenerator} from './index.js';

interface PackageJson {
  description: string;
  name: string;
  version: string;
}

const __dirname = import.meta.dirname;
const packageJsonPath = path.join(__dirname, '../package.json');

const {description, name, version}: PackageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

commander
  .name(name.replace(/^@[^/]+\//, ''))
  .description(description)
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

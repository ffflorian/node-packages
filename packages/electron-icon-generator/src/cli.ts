#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {program as commander} from 'commander';

import {IconGenerator} from './index.js';

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

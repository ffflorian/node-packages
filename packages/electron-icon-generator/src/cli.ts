#!/usr/bin/env node

import {program as commander} from 'commander';
import * as fs from 'fs';
import * as path from 'path';

import {IconGenerator} from './';

const defaultPackageJsonPath = path.join(__dirname, 'package.json');
const packageJsonPath = fs.existsSync(defaultPackageJsonPath)
  ? defaultPackageJsonPath
  : path.join(__dirname, '../package.json');

const packageJson = fs.readFileSync(packageJsonPath, 'utf-8');
const {bin, description, version} = JSON.parse(packageJson);

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

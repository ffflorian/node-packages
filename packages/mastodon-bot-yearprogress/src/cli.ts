#!/usr/bin/env node

import {program as commander} from 'commander';
import * as fs from 'fs';
import * as path from 'path';

import {YearProgressClient} from './YearProgressClient';

interface CommanderOptions {
  config?: string;
  dryRun?: boolean;
  force?: boolean;
  server?: string;
  token?: string;
}

const defaultPackageJsonPath = path.join(__dirname, 'package.json');
const packageJsonPath = fs.existsSync(defaultPackageJsonPath)
  ? defaultPackageJsonPath
  : path.join(__dirname, '../package.json');

const packageJson = fs.readFileSync(packageJsonPath, 'utf-8');
const {bin, description, version} = JSON.parse(packageJson);

commander
  .name(Object.keys(bin)[0])
  .version(version)
  .description(description)
  .option('-s, --server <host>', 'Specify a Mastodon server (e.g. https://mastodon.social)')
  .option('-t, --token <token>', 'Specify an access token')
  .option('-d, --dry-run', 'Do not actually send data or write config file')
  .option('-c, --config <file>', 'Specify a config file')
  .option('-f, --force', 'Force sending toot')
  .parse(process.argv);

const {config, dryRun, force, server, token} = commander.opts() as CommanderOptions;

new YearProgressClient({accessToken: token, baseURL: server, configFile: config, dryRun: dryRun, forceSending: force})
  .run()
  .then(() => process.exit())
  .catch(error => {
    console.error(error);
    process.exit(1);
  });

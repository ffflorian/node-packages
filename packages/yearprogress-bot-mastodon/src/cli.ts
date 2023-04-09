#!/usr/bin/env node

import {program as commander} from 'commander';
import {createRequire} from 'node:module';
const require = createRequire(import.meta.url);

import {YearProgressClient} from './YearProgressClient.js';

interface CommanderOptions {
  config?: string;
  dryRun?: boolean;
  force?: boolean;
  server?: string;
  token?: string;
}

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

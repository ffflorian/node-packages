#!/usr/bin/env node

import * as fs from 'node:fs';
import * as path from 'node:path';
import {fileURLToPath} from 'node:url';
import {program as commander} from 'commander';

import {ImpfstatusClient} from './ImpfstatusClient.js';

interface CommanderOptions {
  config?: string;
  dryRun?: boolean;
  force?: boolean;
  ntfyTopic?: string;
  server?: string;
  token?: string;
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const packageJsonPath = path.join(__dirname, '../package.json');

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
  .option('-n, --ntfy-topic <topic>', 'Send error messages to ntfy')
  .parse(process.argv);

const {config, dryRun, force, ntfyTopic, server, token} = commander.opts() as CommanderOptions;

new ImpfstatusClient({
  accessToken: token,
  baseURL: server,
  configFile: config,
  dryRun: dryRun,
  forceSending: force,
  ntfyTopic,
})
  .run()
  .then(() => process.exit())
  .catch(error => {
    console.error(error);
    process.exit(1);
  });

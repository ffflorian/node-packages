#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {program as commander} from 'commander';

import {HttpsProxy} from './HttpsProxy.js';

interface PackageJson {
  description: string;
  name: string;
  version: string;
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const packageJsonPath = path.join(__dirname, '../package.json');

const {description, name, version}: PackageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

commander
  .name(name.replace(/^@[^/]+\//, ''))
  .description(`${description}\nIf password and username are not set, no authentication will be required.`)
  .option('-p, --password <password>', 'set the password')
  .option('-P, --port <port>', 'set the port', '8080')
  .option('-t, --target <url>', 'set the target URL to forward users to')
  .option('-u, --username <username>', 'set the username')
  .version(version, '-v, --version')
  .parse(process.argv);

const commanderOptions = commander.opts();

if (
  (commanderOptions.password && !commanderOptions.username) ||
  (!commanderOptions.password && commanderOptions.username)
) {
  console.error('Password and username are both required for authentication.');
  commander.outputHelp();
  process.exit(1);
}

new HttpsProxy({
  ...(commanderOptions.password && {password: commanderOptions.password}),
  ...(commanderOptions.port && {port: commanderOptions.port}),
  ...(commanderOptions.target && {target: commanderOptions.target}),
  ...(commanderOptions.username && {username: commanderOptions.username}),
}).start();

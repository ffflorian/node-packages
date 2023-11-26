#!/usr/bin/env node

import {program as commander} from 'commander';
import {createRequire} from 'module';
const require = createRequire(import.meta.url);

import {HttpsProxy} from './HttpsProxy.js';

interface PackageJson {
  description: string;
  name: string;
  version: string;
}

const {description, name, version}: PackageJson = require('../package.json');

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

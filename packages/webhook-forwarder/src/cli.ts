#!/usr/bin/env node

import 'reflect-metadata';
import {program as commander} from 'commander';
import fs from 'node:fs/promises';
import path from 'node:path';

import {WebhookForwarder} from './WebhookForwarder.js';

interface PackageJson {
  description: string;
  name: string;
  version: string;
}

const __dirname = import.meta.dirname;
const packageJsonPath = path.join(__dirname, '../package.json');
const {description, name, version}: PackageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf-8'));

commander
  .name(name)
  .description(description)
  .option('-H, --host <host>', 'set the host to listen on', process.env.WEBHOOK_FORWARDER_HOST)
  .option('-p, --port <port>', 'set the port to listen on', process.env.WEBHOOK_FORWARDER_PORT)
  .option(
    '-t, --target <url>',
    'set a target URL for a single-route setup (path defaults to /)',
    process.env.WEBHOOK_FORWARDER_TARGET
  )
  .option('-P, --path <path>', 'set the path for a single-route setup (used with --target)', '/')
  .option('-T, --timeout <ms>', 'set the forwarding request timeout in ms', process.env.WEBHOOK_FORWARDER_TIMEOUT)
  .option('-c, --config <path>', 'use a configuration file')
  .option('--noconfig', "don't look for a configuration file")
  .version(version, '-v, --version')
  .parse(process.argv);

const options = commander.opts();

const forwarder = new WebhookForwarder({
  ...(options.noconfig ? {configFile: false} : options.config ? {configFile: options.config} : {}),
  ...(options.host && {host: options.host}),
  ...(options.port && {port: parseInt(options.port, 10)}),
  ...(options.target && {routes: [{path: options.path || '/', target: options.target}]}),
  ...(options.timeout && {timeout: parseInt(options.timeout, 10)}),
});

try {
  await forwarder.start();
} catch (error) {
  console.error('Error:', (error as Error).message);
  process.exit(1);
}

#!/usr/bin/env node

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
  .requiredOption(
    '-t, --target <url>',
    'set the target URL to forward webhooks to',
    process.env.WEBHOOK_FORWARDER_TARGET
  )
  .option('-H, --host <host>', 'set the host to listen on', process.env.WEBHOOK_FORWARDER_HOST || '0.0.0.0')
  .option(
    '-p, --port <port>',
    'set the port to listen on',
    process.env.WEBHOOK_FORWARDER_PORT || '8080'
  )
  .option('-P, --path <path>', 'set the path to listen on', process.env.WEBHOOK_FORWARDER_PATH || '/')
  .option(
    '-T, --timeout <ms>',
    'set the forwarding request timeout in ms',
    process.env.WEBHOOK_FORWARDER_TIMEOUT || '30000'
  )
  .version(version, '-v, --version')
  .parse(process.argv);

const options = commander.opts();

const forwarder = new WebhookForwarder({
  host: options.host,
  path: options.path,
  port: parseInt(options.port, 10),
  targetUrl: options.target,
  timeout: parseInt(options.timeout, 10),
});

void forwarder.start();

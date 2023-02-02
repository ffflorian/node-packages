#!/usr/bin/env node

import {program as commander} from 'commander';
import * as findUp from 'find-up';
import * as fs from 'fs';
import open = require('open');
import * as path from 'path';

import {RepositoryService} from './RepositoryService';

const defaultPackageJsonPath = path.join(__dirname, 'package.json');
const packageJsonPath = fs.existsSync(defaultPackageJsonPath)
  ? defaultPackageJsonPath
  : path.join(__dirname, '../package.json');

const packageJson = fs.readFileSync(packageJsonPath, 'utf-8');
const {description, name, version}: {description: string; name: string; version: string} = JSON.parse(packageJson);

commander
  .name(name.replace(/^@[^/]+\//, ''))
  .description(description)
  .option('-d, --debug', 'Enable debug logging')
  .option('-p, --print', 'Just print the URL')
  .option('-b, --branch', 'Open the branch tree (and not the PR)')
  .option('-t, --timeout <number>', 'Set a custom timeout for HTTP requests')
  .arguments('[directory]')
  .version(version, '-v, --version')
  .parse(process.argv);

const resolvedBaseDir = path.resolve(commander.args[0] || '.');
const commanderOptions = commander.opts();

void (async () => {
  try {
    const gitDir = await findUp('.git', {cwd: resolvedBaseDir, type: 'directory'});
    if (!gitDir) {
      throw new Error(`Could not find a git repository in "${resolvedBaseDir}".`);
    }

    const repositoryService = new RepositoryService({
      ...(commanderOptions.debug && {debug: commanderOptions.debug}),
      ...(commanderOptions.timeout && {timeout: parseInt(commanderOptions.timeout, 10)}),
    });

    let fullUrl = await repositoryService.getFullUrl(gitDir);

    if (!commanderOptions.branch) {
      const pullRequestUrl = await repositoryService.getPullRequestUrl(fullUrl);
      if (pullRequestUrl) {
        fullUrl = pullRequestUrl;
      }
    }

    if (commanderOptions.print) {
      console.info(fullUrl);
      return;
    }

    await open(fullUrl);
    process.exit();
  } catch (error) {
    console.error((error as Error).message);
    process.exit(1);
  }
})();

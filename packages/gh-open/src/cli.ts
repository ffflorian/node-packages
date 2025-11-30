#!/usr/bin/env node

import fs from 'node:fs/promises';
import path from 'node:path';
import {program as commander} from 'commander';
import {findUp} from 'find-up';
import open from 'open';

import {RepositoryService} from './RepositoryService.js';

interface PackageJson {
  description: string;
  name: string;
  version: string;
}

const __dirname = import.meta.dirname;
const packageJsonPath = path.join(__dirname, '../package.json');
const {description, name, version}: PackageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf-8'));

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
    } else {
      await open(fullUrl);
    }
    process.exit();
  } catch (error) {
    console.error((error as Error).message);
    process.exit(1);
  }
})();

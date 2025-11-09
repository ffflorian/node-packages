#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline';
import {program as commander} from 'commander';
import {cosmiconfigSync} from 'cosmiconfig';
import logdown from 'logdown';

import {AutoMerge, Repository, RepositoryResult} from './AutoMerge.js';
import type {AutoMergeConfig} from './types/AutoMergeConfig.js';
import {pluralize} from './util.js';

const input = readline.createInterface(process.stdin, process.stdout);
const logger = logdown('auto-merge', {
  logger: console,
  markdown: false,
});
logger.state.isEnabled = true;

interface PackageJson {
  description: string;
  name: string;
  version: string;
}

const __dirname = import.meta.dirname;
const packageJsonPath = path.join(__dirname, '../package.json');

const {description, name, version}: PackageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

commander
  .name(name.replace(/^@[^/]+\//, ''))
  .description(description)
  .option('-a, --approve', 'approve before merging')
  .option('-c, --config <path>', 'specify a configuration file (default: .automergerc.json)')
  .option('-d, --dry-run', `don't send any data`)
  .option('-f, --merge-drafts', 'merge draft PRs', false)
  .option('-s, --squash', 'squash when merging', false)
  .version(version)
  .parse(process.argv);

const commanderOptions = commander.opts();
const configExplorer = cosmiconfigSync('automerge');
const configResult = commanderOptions.config ? configExplorer.load(commanderOptions.config) : configExplorer.search();

if (!configResult || configResult.isEmpty) {
  logger.error('No valid configuration file found.');
  commander.help();
}

const configFileData: AutoMergeConfig = {
  ...configResult.config,
  ...(commanderOptions.approve && {autoApprove: commanderOptions.approve}),
  ...(commanderOptions.dryRun && {dryRun: commanderOptions.dryRun}),
};

async function runAction(autoMerge: AutoMerge, repositories: Repository[], pullRequestSlug: string): Promise<void> {
  const regex = new RegExp(pullRequestSlug, 'gi');

  let approveResults: RepositoryResult[] = [];

  if (configFileData.autoApprove) {
    approveResults = await autoMerge.approveByMatch(regex, repositories);
  }

  const mergeResults = await autoMerge.mergeByMatch(regex, repositories);

  const successCount = [...approveResults, ...mergeResults].filter(repository => {
    return repository.actionResults.some(result => typeof result.error === 'undefined');
  }).length;

  const prPluralized = pluralize('PR', successCount);
  const doAction = configFileData.autoApprove ? 'Approved and merged' : 'Merged';
  const infoMessage = `${doAction} ${successCount} ${prPluralized} matching "${regex}".`;

  if (successCount === 0) {
    logger.warn(infoMessage);
  } else {
    logger.info(infoMessage);
  }
}

function askQuestion(question: string): Promise<string> {
  return new Promise(resolve => {
    input.question(question, answer => resolve(answer));
  });
}

async function askAction(autoApprover: AutoMerge, repositories: Repository[]): Promise<void> {
  const doAction = configFileData.autoApprove ? 'approve and merge' : 'merge';
  const answer = await askQuestion(`ℹ️  auto-merge Which PR would you like to ${doAction} (enter a branch name)? `);

  await runAction(autoApprover, repositories, answer);
  await askAction(autoApprover, repositories);
}

void (async () => {
  try {
    const autoApprover = new AutoMerge(configFileData);
    logger.info('Loading all pull requests ...');
    const allRepositories = await autoApprover.getRepositoriesWithOpenPullRequests();

    if (allRepositories.length) {
      const repositories = allRepositories
        .sort((repositoryA, repositoryB) => repositoryB.pullRequests.length - repositoryA.pullRequests.length)
        .map(repository => {
          const prPluralized = pluralize('PR', repository.pullRequests.length);
          return `${repository.repositorySlug} (${repository.pullRequests.length} open ${prPluralized})`;
        });

      logger.info('Found the following repositories to check:', repositories);
      await askAction(autoApprover, allRepositories);
    } else {
      logger.info('Could not find any repositories with open pull requests.');
    }

    process.exit();
  } catch (error) {
    logger.error(error);
    process.exit(1);
  }
})();

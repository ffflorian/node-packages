#!/usr/bin/env node

import {program as commander} from 'commander';
import {cosmiconfigSync} from 'cosmiconfig';
import * as fs from 'fs';
import * as logdown from 'logdown';
import * as path from 'path';
import * as readline from 'readline';

import {ApproverConfig, AutoApprover, Repository} from './AutoApprover';
import {pluralize} from './util';

const input = readline.createInterface(process.stdin, process.stdout);
const logger = logdown('auto-approver', {
  logger: console,
  markdown: false,
});
logger.state.isEnabled = true;

const defaultPackageJsonPath = path.join(__dirname, 'package.json');
const packageJsonPath = fs.existsSync(defaultPackageJsonPath)
  ? defaultPackageJsonPath
  : path.join(__dirname, '../package.json');

const {bin, description, version} = require(packageJsonPath);

commander
  .name(Object.keys(bin)[0])
  .description(description)
  .option('-m, --message <text>', 'comment on PRs instead of approving them')
  .option('-c, --config <path>', 'specify a configuration file (default: .approverrc.json)')
  .option('-d, --dry-run', `don't send any data`)
  .version(version)
  .parse(process.argv);

const commanderOptions = commander.opts();
const configExplorer = cosmiconfigSync('approver');
const configResult = commanderOptions.config ? configExplorer.load(commanderOptions.config) : configExplorer.search();

if (!configResult || configResult.isEmpty) {
  logger.error('No valid configuration file found.');
  commander.help();
}

const configFileData: ApproverConfig = {
  ...configResult.config,
  ...(commanderOptions.message && {useComment: commanderOptions.message}),
  ...(commanderOptions.dryRun && {dryRun: commanderOptions.dryRun}),
};

async function runAction(
  autoApprover: AutoApprover,
  repositories: Repository[],
  pullRequestSlug: string
): Promise<void> {
  const regex = new RegExp(pullRequestSlug, 'gi');
  const action = configFileData.useComment ? 'Commented on' : 'Approved';
  const actionResult = configFileData.useComment
    ? await autoApprover.commentByMatch(regex, configFileData.useComment, repositories)
    : await autoApprover.approveByMatch(regex, repositories);

  const actedRepositories = actionResult.reduce((count, repository) => {
    return count + repository.actionResults.length;
  }, 0);

  const prPluralized = pluralize('PR', actedRepositories);
  logger.info(`${action} ${actedRepositories} ${prPluralized} matching "${regex}".`);
}

function askQuestion(question: string): Promise<string> {
  return new Promise(resolve => {
    input.question(question, answer => resolve(answer));
  });
}

async function askAction(autoApprover: AutoApprover, repositories: Repository[], doAction: string): Promise<void> {
  const answer = await askQuestion(`ℹ️  auto-approver Which PR would you like to ${doAction} (enter a branch name)? `);
  await runAction(autoApprover, repositories, answer);
  await askAction(autoApprover, repositories, doAction);
}

void (async () => {
  try {
    const autoApprover = new AutoApprover(configFileData);
    logger.info('Loading all pull requests ...');
    const allRepositories = await autoApprover.getRepositoriesWithOpenPullRequests();

    if (!!allRepositories.length) {
      const repositories = allRepositories
        .sort((repositoryA, repositoryB) => repositoryB.pullRequests.length - repositoryA.pullRequests.length)
        .map(repository => {
          const prPluralized = pluralize('PR', repository.pullRequests.length);
          return `${repository.repositorySlug} (${repository.pullRequests.length} open ${prPluralized})`;
        });

      logger.info('Found the following repositories to check:', repositories);

      const doAction = configFileData.useComment ? 'comment on' : 'approve';
      await askAction(autoApprover, allRepositories, doAction);
    } else {
      logger.info('Could not find any repositories with open pull requests.');
    }

    process.exit();
  } catch (error) {
    logger.error(error);
    process.exit(1);
  }
})();

import {promises as fsAsync} from 'fs';
import * as logdown from 'logdown';
import * as path from 'path';

import {GitHubClient} from './GitHubClient';

export interface Options {
  debug?: boolean;
  timeout?: number;
}

export class RepositoryService {
  private readonly gitHubClient: GitHubClient;
  private readonly logger: logdown.Logger;
  private readonly options: Required<Options>;
  private readonly parser = {
    fullUrl: new RegExp('^(?:.+?://(?:.+@)?|(?:.+@)?)(.+?)[:/](.+?)(?:.git)?/?$', 'i'),
    gitBranch: new RegExp('ref: refs/heads/(?<branch>.*)$', 'mi'),
    pullRequest: new RegExp('github\\.com\\/(?<user>[^\\/]+)\\/(?<project>[^/]+)\\/tree\\/(?<branch>.*)'),
    rawUrl: new RegExp('.*url = (?<rawUrl>.*)', 'mi'),
  };

  constructor(options?: Options) {
    this.options = {debug: false, timeout: 2000, ...options};
    this.gitHubClient = new GitHubClient(this.options.timeout);
    this.logger = logdown('gh-open', {
      logger: console,
      markdown: false,
    });
    this.logger.state.isEnabled = this.options.debug;
  }

  async getFullUrl(gitDir: string): Promise<string> {
    const rawUrl = await this.parseGitConfig(gitDir);
    const gitBranch = await this.parseGitBranch(gitDir);
    const match = this.parser.fullUrl.exec(rawUrl);

    if (!match) {
      const errorMessage = 'Could not convert raw URL.';
      throw new Error(errorMessage);
    }

    const parsedUrl = rawUrl.replace(this.parser.fullUrl, 'https://$1/$2');

    this.logger.info('Found parsed URL', {parsedUrl});

    return `${parsedUrl}/tree/${gitBranch}`;
  }

  async getPullRequestUrl(url: string): Promise<string | void> {
    const match = this.parser.pullRequest.exec(url);

    if (!match || !match.groups) {
      const errorMessage = `Could not convert GitHub URL "${url}" to pull request`;
      throw new Error(errorMessage);
    }

    const {user, project, branch} = match.groups;

    try {
      const response = await this.gitHubClient.getPullRequestByBranch(user, project, branch);

      if (response && response._links && response._links.html && response._links.html.href) {
        const pullRequestUrl = response._links.html.href;
        this.logger.info('Got pull request URL', {pullRequestUrl});
        return pullRequestUrl;
      }
    } catch (error) {
      this.logger.warn(`Request failed: "${(error as Error).message}"`);
    }
  }

  async parseGitBranch(gitDir: string): Promise<string> {
    const gitHeadFile = path.join(gitDir, 'HEAD');

    let gitHead: string;

    try {
      gitHead = await fsAsync.readFile(gitHeadFile, 'utf-8');
      gitHead = gitHead.trim();
      this.logger.info('Read git head file', {gitHead});
    } catch (error) {
      const errorMessage = `Could not find git HEAD file in "${gitDir}".`;
      throw new Error(errorMessage);
    }

    const match = this.parser.gitBranch.exec(gitHead);

    if (!match || !match.groups) {
      const errorMessage = `No branch found in git HEAD file: "${gitHead}"`;
      throw new Error(errorMessage);
    }

    return match.groups.branch;
  }

  async parseGitConfig(gitDir: string): Promise<string> {
    const gitConfigFile = path.join(gitDir, 'config');

    let gitConfig: string;

    try {
      gitConfig = await fsAsync.readFile(gitConfigFile, 'utf-8');
      gitConfig = gitConfig.trim();
      this.logger.info('Read git config file', {gitConfigFile});
    } catch (error) {
      const errorMessage = `Could not find git config file: "${gitConfigFile}"`;
      throw new Error(errorMessage);
    }

    const match = this.parser.rawUrl.exec(gitConfig);

    if (!match || !match.groups) {
      const errorMessage = `No URL found in git config file: "${gitConfigFile}"`;
      throw new Error(errorMessage);
    }

    const rawUrl = match.groups.rawUrl;

    this.logger.info('Found raw URL', {rawUrl});

    return rawUrl;
  }
}

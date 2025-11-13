import fs from 'node:fs';
import path from 'node:path';
import axios, {AxiosError, AxiosInstance} from 'axios';
import logdown from 'logdown';

import type {AutoMergeConfig, ActionResult, GitHubPullRequest, Repository, RepositoryResult} from './types/index.js';

interface PackageJson {
  bin: Record<string, string>;
  version: string;
}

const __dirname = import.meta.dirname;
const packageJsonPath = path.join(__dirname, '../package.json');

const {bin, version: toolVersion}: PackageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
const toolName = Object.keys(bin)[0];

export class AutoMerge {
  private readonly apiClient: AxiosInstance;
  private readonly config: AutoMergeConfig;
  private readonly logger: logdown.Logger;

  constructor(config: AutoMergeConfig) {
    this.config = config;
    this.logger = logdown('auto-merge', {
      logger: console,
      markdown: false,
    });
    this.logger.state.isEnabled = true;
    this.apiClient = axios.create({
      baseURL: 'https://api.github.com',
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: `token ${this.config.authToken}`,
        'User-Agent': `${toolName} v${toolVersion}`,
      },
    });
    this.checkConfig(this.config);
  }

  private checkConfig(config: AutoMergeConfig): void {
    if (!config.projects?.gitHub || config.projects.gitHub.length < 1) {
      throw new Error('No projects in config file specified');
    }

    if (!config.authToken) {
      throw new Error('No authentication token in config file specified');
    }
  }

  private checkRepositorySlug(repositorySlug: string): boolean {
    const gitHubUsernameRegex = /^\w+(?:-?\w+){0,37}\w$/i;
    const gitHubRepositoryRegex = /^[\w-.]{0,99}\w$/i;
    const [userName, repositoryName] = repositorySlug.trim().replace(/^\//, '').replace(/\/$/, '').split('/');
    if (!repositoryName || !gitHubUsernameRegex.test(userName) || !gitHubRepositoryRegex.test(repositoryName)) {
      this.logger.warn(`Invalid GitHub repository slug "${repositorySlug}". Skipping.`);
      return false;
    }
    return true;
  }

  async approveByMatch(regex: RegExp, repositories?: Repository[]): Promise<RepositoryResult[]> {
    const allRepositories = repositories || (await this.getRepositoriesWithOpenPullRequests());
    const matchingRepositories = this.getMatchingRepositories(allRepositories, regex);

    const processedRepositories: RepositoryResult[] = [];
    for (const {pullRequests, repositorySlug} of matchingRepositories) {
      const actionResults: ActionResult[] = [];
      for (const pullRequest of pullRequests) {
        actionResults.push(await this.approveByPullNumber(repositorySlug, pullRequest.number));
      }
      processedRepositories.push({actionResults, repositorySlug});
    }

    return processedRepositories;
  }

  private getMatchingRepositories(repositories: Repository[], regex: RegExp): Repository[] {
    const matchingRepositories: Repository[] = [];
    for (const repository of repositories) {
      const matchingPullRequests = repository.pullRequests.filter(pullRequest =>
        new RegExp(regex).test(pullRequest.head.ref)
      );
      if (matchingPullRequests.length) {
        matchingRepositories.push({pullRequests: matchingPullRequests, repositorySlug: repository.repositorySlug});
      }
    }
    return matchingRepositories;
  }

  private async isPullRequestMergeable(repositorySlug: string, pullNumber: number): Promise<boolean> {
    const resourceUrl = `/repos/${repositorySlug}/pulls/${pullNumber}`;
    const response = await this.apiClient.get<GitHubPullRequest>(resourceUrl);
    return response.data.mergeable_state === 'clean';
  }

  async mergeByMatch(regex: RegExp, repositories?: Repository[]): Promise<RepositoryResult[]> {
    const allRepositories = repositories || (await this.getRepositoriesWithOpenPullRequests());
    const matchingRepositories = this.getMatchingRepositories(allRepositories, regex);

    const processedRepositories: RepositoryResult[] = [];
    for (const {pullRequests, repositorySlug} of matchingRepositories) {
      const actionResults: ActionResult[] = [];
      for (const pullRequest of pullRequests) {
        const isMergeable = this.isPullRequestMergeable(repositorySlug, pullRequest.number);
        if (!isMergeable) {
          this.logger.warn(`Pull request #${pullRequest.number} in "${repositorySlug}" is not mergeable. Skipping.`);
          continue;
        }
        actionResults.push(await this.mergePullRequest(repositorySlug, pullRequest.number, this.config.squash));
      }
      processedRepositories.push({actionResults, repositorySlug});
    }

    return processedRepositories;
  }

  async approveByPullNumber(repositorySlug: string, pullNumber: number): Promise<ActionResult> {
    const actionResult: ActionResult = {pullNumber, status: 'good'};

    try {
      if (!this.config.dryRun) {
        await this.postReview(repositorySlug, pullNumber);
      }
    } catch (error) {
      this.logger.error(
        `Could not approve request #${pullNumber} in "${repositorySlug}": ${(error as AxiosError).message}`
      );
      actionResult.status = 'bad';
      actionResult.error = (error as AxiosError).toString();
    }
    return actionResult;
  }

  async mergePullRequest(repositorySlug: string, pullNumber: number, squash: boolean = false): Promise<ActionResult> {
    const actionResult: ActionResult = {pullNumber, status: 'good'};

    try {
      if (!this.config.dryRun) {
        await this.putMerge(repositorySlug, pullNumber, squash);
      }
    } catch (error) {
      this.logger.error(
        `Could not merge pull request #${pullNumber} in "${repositorySlug}": ${(error as AxiosError).message}`
      );
      actionResult.status = 'bad';
      actionResult.error = (error as AxiosError).toString();
    }
    return actionResult;
  }

  async getAllRepositories(): Promise<Repository[]> {
    const repositorySlugs = this.config.projects.gitHub.filter(repositorySlug =>
      this.checkRepositorySlug(repositorySlug)
    );

    const repositories: Repository[] = [];

    for (const repositorySlug of repositorySlugs) {
      try {
        const pullRequests = await this.getPullRequestsBySlug(repositorySlug);
        repositories.push({pullRequests, repositorySlug});
      } catch (error) {
        this.logger.error(`Could not get pull requests for "${repositorySlug}": ${(error as AxiosError).message}`);
      }
    }

    return repositories;
  }

  async getRepositoriesWithOpenPullRequests(): Promise<Repository[]> {
    const allRepositories = await this.getAllRepositories();
    return allRepositories.filter(repository => !!repository.pullRequests.length);
  }

  /** @see https://docs.github.com/en/rest/reference/pulls#create-a-review-for-a-pull-request */
  private async postReview(repositorySlug: string, pullNumber: number): Promise<void> {
    const resourceUrl = `/repos/${repositorySlug}/pulls/${pullNumber}/reviews`;
    await this.apiClient.post(resourceUrl, {event: 'APPROVE'});
  }

  /** @see https://docs.github.com/en/rest/reference/issues#create-an-issue-comment */
  private async putMerge(repositorySlug: string, pullNumber: number, squash?: boolean): Promise<void> {
    const resourceUrl = `/repos/${repositorySlug}/pulls/${pullNumber}/merge`;
    await this.apiClient.put(resourceUrl, squash ? {merge_method: 'squash'} : undefined);
  }

  private async getPullRequestsBySlug(repositorySlug: string): Promise<GitHubPullRequest[]> {
    const resourceUrl = `/repos/${repositorySlug}/pulls`;
    const params = {per_page: 100, state: 'open'};
    const response = await this.apiClient.get<GitHubPullRequest[]>(resourceUrl, {params});
    return response.data;
  }
}

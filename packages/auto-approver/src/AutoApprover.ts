import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import axios, {AxiosError, AxiosInstance} from 'axios';
import logdown from 'logdown';

interface PackageJson {
  bin: Record<string, string>;
  version: string;
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const packageJsonPath = path.join(__dirname, '../package.json');

const {bin, version: toolVersion}: PackageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
const toolName = Object.keys(bin)[0];

/** @see https://docs.github.com/en/rest/reference/pulls#get-a-pull-request */
interface GitHubPullRequest {
  draft: boolean;
  head: {
    /** The branch name */
    ref: string;
    /** The commit SHA-1 hash */
    sha: string;
  };
  /** The pull request number */
  number: number;
  /** The pull request title */
  title: string;
}

export interface ActionResult {
  error?: string;
  pullNumber: number;
  status: 'bad' | 'good';
}

export interface ApproverConfig {
  /** The GitHub auth token */
  authToken: string;
  /** Don't send any data */
  dryRun?: boolean;
  /** Include draft PRs */
  keepDrafts?: boolean;
  /** All projects to include */
  projects: {
    /** All projects hosted on GitHub in the format `user/repo` */
    gitHub: string[];
  };
  /** Post a comment on the PRs instead of approving them */
  useComment?: string;
  /**
   * Currently not in use
   * @deprecated
   */
  verbose?: boolean;
}

export interface Repository {
  pullRequests: GitHubPullRequest[];
  repositorySlug: string;
}

export interface RepositoryResult {
  actionResults: ActionResult[];
  repositorySlug: string;
}

export class AutoApprover {
  private readonly apiClient: AxiosInstance;
  private readonly config: ApproverConfig;
  private readonly logger: logdown.Logger;

  constructor(config: ApproverConfig) {
    this.config = config;
    this.logger = logdown('auto-approver', {
      logger: console,
      markdown: false,
    });
    this.logger.state.isEnabled = true;
    this.apiClient = axios.create({
      baseURL: 'https://api.github.com',
      headers: {
        Authorization: `token ${this.config.authToken}`,
        'User-Agent': `${toolName} v${toolVersion}`,
      },
    });
    this.checkConfig(this.config);
  }

  private checkConfig(config: ApproverConfig): void {
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

    const resultPromises = matchingRepositories.map(async ({pullRequests, repositorySlug}) => {
      const actionPromises = pullRequests.map(pullRequest =>
        this.approveByPullNumber(repositorySlug, pullRequest.number)
      );
      const actionResults = await Promise.all(actionPromises);
      return {actionResults, repositorySlug};
    });

    return Promise.all(resultPromises);
  }

  private getMatchingRepositories(repositories: Repository[], regex: RegExp): Repository[] {
    return repositories
      .map(repository => {
        const matchingPullRequests = repository.pullRequests.filter(pullRequest =>
          new RegExp(regex).test(pullRequest.head.ref)
        );
        if (matchingPullRequests.length) {
          return {pullRequests: matchingPullRequests, repositorySlug: repository.repositorySlug};
        }
        return undefined;
      })
      .filter(Boolean) as Repository[];
  }

  async commentByMatch(regex: RegExp, comment: string, repositories?: Repository[]): Promise<RepositoryResult[]> {
    const allRepositories = repositories || (await this.getRepositoriesWithOpenPullRequests());
    const matchingRepositories = this.getMatchingRepositories(allRepositories, regex);

    const resultPromises = matchingRepositories.map(async ({pullRequests, repositorySlug}) => {
      const actionPromises = pullRequests.map(pullRequest =>
        this.commentOnPullRequest(repositorySlug, pullRequest.number, comment)
      );
      const actionResults = await Promise.all(actionPromises);
      return {actionResults, repositorySlug};
    });

    return Promise.all(resultPromises);
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

  async commentOnPullRequest(repositorySlug: string, pullNumber: number, comment: string): Promise<ActionResult> {
    const actionResult: ActionResult = {pullNumber, status: 'good'};

    try {
      if (!this.config.dryRun) {
        await this.postComment(repositorySlug, pullNumber, comment);
      }
    } catch (error) {
      this.logger.error(
        `Could not comment on pull request #${pullNumber} in "${repositorySlug}": ${(error as AxiosError).message}`
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

    const repositoriesPromises = repositorySlugs.map(async repositorySlug => {
      try {
        const pullRequests = await this.getPullRequestsBySlug(repositorySlug);
        return {pullRequests, repositorySlug};
      } catch (error) {
        this.logger.error(`Could not get pull requests for "${repositorySlug}": ${(error as AxiosError).message}`);
        return undefined;
      }
    });

    return (await Promise.all(repositoriesPromises)).filter(Boolean) as Repository[];
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
  private async postComment(repositorySlug: string, pullNumber: number, comment: string): Promise<void> {
    const resourceUrl = `/repos/${repositorySlug}/issues/${pullNumber}/comments`;
    await this.apiClient.post(resourceUrl, {body: comment});
  }

  private async getPullRequestsBySlug(repositorySlug: string): Promise<GitHubPullRequest[]> {
    const resourceUrl = `/repos/${repositorySlug}/pulls`;
    const params = {state: 'open'};
    const response = await this.apiClient.get<GitHubPullRequest[]>(resourceUrl, {params});
    if (!this.config.keepDrafts) {
      response.data = response.data.filter(pr => !pr.draft);
    }
    return response.data;
  }
}

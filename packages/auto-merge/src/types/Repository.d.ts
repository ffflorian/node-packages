import type {GitHubSimplePullRequest} from './GitHubSimplePullRequest.js';

export interface Repository {
  pullRequests: GitHubSimplePullRequest[];
  repositorySlug: string;
}

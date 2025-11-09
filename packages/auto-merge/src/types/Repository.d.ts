import type {GitHubPullRequest} from './GitHubPullRequest.js';

export interface Repository {
  pullRequests: GitHubPullRequest[];
  repositorySlug: string;
}

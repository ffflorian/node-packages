export interface PullRequest {
  _links: {
    html: {
      href: string;
    };
  };
  head: {
    ref: string;
  };
}

const TWO_SECONDS_IN_MILLIS = 2000;

export class GitHubClient {
  private readonly baseURL: string;
  private readonly timeout: number;

  constructor(timeout: number = TWO_SECONDS_IN_MILLIS) {
    this.baseURL = 'https://api.github.com';
    this.timeout = timeout;
  }

  async getPullRequestByBranch(user: string, repository: string, branch: string): Promise<PullRequest | undefined> {
    const pullRequests = await this.getPullRequests(user, repository);
    return pullRequests.find(pr => !!pr.head && pr.head.ref === branch);
  }

  /**
   * @see https://developer.github.com/v3/pulls/#list-pull-requests
   */
  async getPullRequests(user: string, repository: string): Promise<PullRequest[]> {
    const resourceUrl = new URL(`repos/${user}/${repository}/pulls`, this.baseURL);
    resourceUrl.search = new URLSearchParams({per_page: '100', state: 'open'}).toString();

    const response = await fetch(resourceUrl, {signal: AbortSignal.timeout(this.timeout)});

    if (!response.ok) {
      throw new Error(`Error while fetching pull requests: ${response.statusText}`);
    }

    return response.json();
  }
}

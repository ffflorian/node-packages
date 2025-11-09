export interface AutoMergeConfig {
  /** The GitHub auth token (needs read access to metadata and read and write access to code and pull requests) */
  authToken: string;
  /** Approve before merging */
  autoApprove?: boolean;
  /** Don't send any data */
  dryRun?: boolean;
  /** All projects to include */
  projects: {
    /** All projects hosted on GitHub in the format `user/repo` */
    gitHub: string[];
  };
  /** Squash when merging */
  squash?: boolean;
}

export interface AutoMergeConfig {
  /** The GitHub auth token */
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

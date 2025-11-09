/**
 * Pull Request Simple
 */
export interface GitHubSimplePullRequest {
  _links: Links;
  active_lock_reason?: string | null;
  assignee: PurpleSimpleUser | null;
  assignees?: AssigneeElement[] | null;
  /**
   * How the author is associated with the repository.
   */
  author_association: AuthorAssociation;
  /**
   * The status of auto merging a pull request.
   */
  auto_merge: AutoMerge | null;
  base: Base;
  body: string | null;
  closed_at: Date | null;
  comments_url: string;
  commits_url: string;
  created_at: Date;
  diff_url: string;
  /**
   * Indicates whether or not the pull request is a draft.
   */
  draft?: boolean;
  head: Head;
  html_url: string;
  id: number;
  issue_url: string;
  labels: Label[];
  locked: boolean;
  merge_commit_sha: string | null;
  merged_at: Date | null;
  milestone: Milestone | null;
  node_id: string;
  number: number;
  patch_url: string;
  requested_reviewers?: RequestedReviewerElement[] | null;
  requested_teams?: Team[] | null;
  review_comment_url: string;
  review_comments_url: string;
  state: string;
  statuses_url: string;
  title: string;
  updated_at: Date;
  url: string;
  user: FluffySimpleUser | null;
}

export interface Links {
  /**
   * Hypermedia Link
   */
  comments: CommentsObject;
  /**
   * Hypermedia Link
   */
  commits: CommitsObject;
  /**
   * Hypermedia Link
   */
  html: HTMLObject;
  /**
   * Hypermedia Link
   */
  issue: IssueObject;
  /**
   * Hypermedia Link
   */
  review_comment: ReviewCommentObject;
  /**
   * Hypermedia Link
   */
  review_comments: ReviewCommentsObject;
  /**
   * Hypermedia Link
   */
  self: SelfObject;
  /**
   * Hypermedia Link
   */
  statuses: StatusesObject;
}

/**
 * Hypermedia Link
 */
export interface CommentsObject {
  href: string;
}

/**
 * Hypermedia Link
 */
export interface CommitsObject {
  href: string;
}

/**
 * Hypermedia Link
 */
export interface HTMLObject {
  href: string;
}

/**
 * Hypermedia Link
 */
export interface IssueObject {
  href: string;
}

/**
 * Hypermedia Link
 */
export interface ReviewCommentObject {
  href: string;
}

/**
 * Hypermedia Link
 */
export interface ReviewCommentsObject {
  href: string;
}

/**
 * Hypermedia Link
 */
export interface SelfObject {
  href: string;
}

/**
 * Hypermedia Link
 */
export interface StatusesObject {
  href: string;
}

/**
 * A GitHub user.
 */
export interface PurpleSimpleUser {
  avatar_url: string;
  email?: string | null;
  events_url: string;
  followers_url: string;
  following_url: string;
  gists_url: string;
  gravatar_id: string | null;
  html_url: string;
  id: number;
  login: string;
  name?: string | null;
  node_id: string;
  organizations_url: string;
  received_events_url: string;
  repos_url: string;
  site_admin: boolean;
  starred_at?: string;
  starred_url: string;
  subscriptions_url: string;
  type: string;
  url: string;
  user_view_type?: string;
}

/**
 * A GitHub user.
 */
export interface AssigneeElement {
  avatar_url: string;
  email?: string | null;
  events_url: string;
  followers_url: string;
  following_url: string;
  gists_url: string;
  gravatar_id: string | null;
  html_url: string;
  id: number;
  login: string;
  name?: string | null;
  node_id: string;
  organizations_url: string;
  received_events_url: string;
  repos_url: string;
  site_admin: boolean;
  starred_at?: string;
  starred_url: string;
  subscriptions_url: string;
  type: string;
  url: string;
  user_view_type?: string;
}

/**
 * How the author is associated with the repository.
 */
export enum AuthorAssociation {
  Collaborator = 'COLLABORATOR',
  Contributor = 'CONTRIBUTOR',
  FirstTimeContributor = 'FIRST_TIME_CONTRIBUTOR',
  FirstTimer = 'FIRST_TIMER',
  Mannequin = 'MANNEQUIN',
  Member = 'MEMBER',
  None = 'NONE',
  Owner = 'OWNER',
}

export interface AutoMerge {
  /**
   * Commit message for the merge commit.
   */
  commit_message: string;
  /**
   * Title for the merge commit message.
   */
  commit_title: string;
  /**
   * A GitHub user.
   */
  enabled_by: EnabledByObject;
  /**
   * The merge method to use.
   */
  merge_method: MergeMethod;
}

/**
 * A GitHub user.
 */
export interface EnabledByObject {
  avatar_url: string;
  email?: string | null;
  events_url: string;
  followers_url: string;
  following_url: string;
  gists_url: string;
  gravatar_id: string | null;
  html_url: string;
  id: number;
  login: string;
  name?: string | null;
  node_id: string;
  organizations_url: string;
  received_events_url: string;
  repos_url: string;
  site_admin: boolean;
  starred_at?: string;
  starred_url: string;
  subscriptions_url: string;
  type: string;
  url: string;
  user_view_type?: string;
}

/**
 * The merge method to use.
 */
export enum MergeMethod {
  Merge = 'merge',
  Rebase = 'rebase',
  Squash = 'squash',
}

export interface Base {
  label: string;
  ref: string;
  /**
   * A repository on GitHub.
   */
  repo: BaseRepo;
  sha: string;
  user: BaseSimpleUser | null;
}

/**
 * A repository on GitHub.
 */
export interface BaseRepo {
  /**
   * Whether to allow Auto-merge to be used on pull requests.
   */
  allow_auto_merge?: boolean;
  /**
   * Whether to allow forking this repo
   */
  allow_forking?: boolean;
  /**
   * Whether to allow merge commits for pull requests.
   */
  allow_merge_commit?: boolean;
  /**
   * Whether to allow rebase merges for pull requests.
   */
  allow_rebase_merge?: boolean;
  /**
   * Whether to allow squash merges for pull requests.
   */
  allow_squash_merge?: boolean;
  /**
   * Whether or not a pull request head branch that is behind its base branch can always be
   * updated even if it is not required to be up to date before merging.
   */
  allow_update_branch?: boolean;
  /**
   * Whether anonymous git access is enabled for this repository
   */
  anonymous_access_enabled?: boolean;
  archive_url: string;
  /**
   * Whether the repository is archived.
   */
  archived: boolean;
  assignees_url: string;
  blobs_url: string;
  branches_url: string;
  clone_url: string;
  /**
   * The status of the code search index for this repository
   */
  code_search_index_status?: PurpleCodeSearchIndexStatus;
  collaborators_url: string;
  comments_url: string;
  commits_url: string;
  compare_url: string;
  contents_url: string;
  contributors_url: string;
  created_at: Date | null;
  /**
   * The default branch of the repository.
   */
  default_branch: string;
  /**
   * Whether to delete head branches when pull requests are merged
   */
  delete_branch_on_merge?: boolean;
  deployments_url: string;
  description: string | null;
  /**
   * Returns whether or not this repository disabled.
   */
  disabled: boolean;
  downloads_url: string;
  events_url: string;
  fork: boolean;
  forks: number;
  forks_count: number;
  forks_url: string;
  full_name: string;
  git_commits_url: string;
  git_refs_url: string;
  git_tags_url: string;
  git_url: string;
  /**
   * Whether discussions are enabled.
   */
  has_discussions?: boolean;
  /**
   * Whether downloads are enabled.
   */
  has_downloads: boolean;
  /**
   * Whether issues are enabled.
   */
  has_issues: boolean;
  has_pages: boolean;
  /**
   * Whether projects are enabled.
   */
  has_projects: boolean;
  /**
   * Whether the wiki is enabled.
   */
  has_wiki: boolean;
  homepage: string | null;
  hooks_url: string;
  html_url: string;
  /**
   * Unique identifier of the repository
   */
  id: number;
  /**
   * Whether this repository acts as a template that can be used to generate new repositories.
   */
  is_template?: boolean;
  issue_comment_url: string;
  issue_events_url: string;
  issues_url: string;
  keys_url: string;
  labels_url: string;
  language: string | null;
  languages_url: string;
  license: PurpleLicenseSimple | null;
  master_branch?: string;
  /**
   * The default value for a merge commit message.
   *
   * - `PR_TITLE` - default to the pull request's title.
   * - `PR_BODY` - default to the pull request's body.
   * - `BLANK` - default to a blank commit message.
   */
  merge_commit_message?: MergeCommitMessage;
  /**
   * The default value for a merge commit title.
   *
   * - `PR_TITLE` - default to the pull request's title.
   * - `MERGE_MESSAGE` - default to the classic title for a merge message (e.g., Merge pull
   * request #123 from branch-name).
   */
  merge_commit_title?: MergeCommitTitle;
  merges_url: string;
  milestones_url: string;
  mirror_url: string | null;
  /**
   * The name of the repository.
   */
  name: string;
  node_id: string;
  notifications_url: string;
  open_issues: number;
  open_issues_count: number;
  /**
   * A GitHub user.
   */
  owner: TentacledSimpleUser;
  permissions?: PurplePermissions;
  /**
   * Whether the repository is private or public.
   */
  private: boolean;
  pulls_url: string;
  pushed_at: Date | null;
  releases_url: string;
  /**
   * The size of the repository, in kilobytes. Size is calculated hourly. When a repository is
   * initially created, the size is 0.
   */
  size: number;
  /**
   * The default value for a squash merge commit message:
   *
   * - `PR_BODY` - default to the pull request's body.
   * - `COMMIT_MESSAGES` - default to the branch's commit messages.
   * - `BLANK` - default to a blank commit message.
   */
  squash_merge_commit_message?: SquashMergeCommitMessage;
  /**
   * The default value for a squash merge commit title:
   *
   * - `PR_TITLE` - default to the pull request's title.
   * - `COMMIT_OR_PR_TITLE` - default to the commit's title (if only one commit) or the pull
   * request's title (when more than one commit).
   */
  squash_merge_commit_title?: SquashMergeCommitTitle;
  ssh_url: string;
  stargazers_count: number;
  stargazers_url: string;
  starred_at?: string;
  statuses_url: string;
  subscribers_url: string;
  subscription_url: string;
  svn_url: string;
  tags_url: string;
  teams_url: string;
  temp_clone_token?: string;
  topics?: string[];
  trees_url: string;
  updated_at: Date | null;
  url: string;
  /**
   * Whether a squash merge commit can use the pull request title as default. **This property
   * is closing down. Please use `squash_merge_commit_title` instead.
   */
  use_squash_pr_title_as_default?: boolean;
  /**
   * The repository visibility: public, private, or internal.
   */
  visibility?: string;
  watchers: number;
  watchers_count: number;
  /**
   * Whether to require contributors to sign off on web-based commits
   */
  web_commit_signoff_required?: boolean;
}

/**
 * The status of the code search index for this repository
 */
export interface PurpleCodeSearchIndexStatus {
  lexical_commit_sha?: string;
  lexical_search_ok?: boolean;
}

/**
 * License Simple
 */
export interface PurpleLicenseSimple {
  html_url?: string;
  key: string;
  name: string;
  node_id: string;
  spdx_id: string | null;
  url: string | null;
}

/**
 * The default value for a merge commit message.
 *
 * - `PR_TITLE` - default to the pull request's title.
 * - `PR_BODY` - default to the pull request's body.
 * - `BLANK` - default to a blank commit message.
 */
export enum MergeCommitMessage {
  Blank = 'BLANK',
  PRBody = 'PR_BODY',
  PRTitle = 'PR_TITLE',
}

/**
 * The default value for a merge commit title.
 *
 * - `PR_TITLE` - default to the pull request's title.
 * - `MERGE_MESSAGE` - default to the classic title for a merge message (e.g., Merge pull
 * request #123 from branch-name).
 */
export enum MergeCommitTitle {
  MergeMessage = 'MERGE_MESSAGE',
  PRTitle = 'PR_TITLE',
}

/**
 * A GitHub user.
 */
export interface TentacledSimpleUser {
  avatar_url: string;
  email?: string | null;
  events_url: string;
  followers_url: string;
  following_url: string;
  gists_url: string;
  gravatar_id: string | null;
  html_url: string;
  id: number;
  login: string;
  name?: string | null;
  node_id: string;
  organizations_url: string;
  received_events_url: string;
  repos_url: string;
  site_admin: boolean;
  starred_at?: string;
  starred_url: string;
  subscriptions_url: string;
  type: string;
  url: string;
  user_view_type?: string;
}

export interface PurplePermissions {
  admin: boolean;
  maintain?: boolean;
  pull: boolean;
  push: boolean;
  triage?: boolean;
}

/**
 * The default value for a squash merge commit message:
 *
 * - `PR_BODY` - default to the pull request's body.
 * - `COMMIT_MESSAGES` - default to the branch's commit messages.
 * - `BLANK` - default to a blank commit message.
 */
export enum SquashMergeCommitMessage {
  Blank = 'BLANK',
  CommitMessages = 'COMMIT_MESSAGES',
  PRBody = 'PR_BODY',
}

/**
 * The default value for a squash merge commit title:
 *
 * - `PR_TITLE` - default to the pull request's title.
 * - `COMMIT_OR_PR_TITLE` - default to the commit's title (if only one commit) or the pull
 * request's title (when more than one commit).
 */
export enum SquashMergeCommitTitle {
  CommitOrPRTitle = 'COMMIT_OR_PR_TITLE',
  PRTitle = 'PR_TITLE',
}

/**
 * A GitHub user.
 */
export interface BaseSimpleUser {
  avatar_url: string;
  email?: string | null;
  events_url: string;
  followers_url: string;
  following_url: string;
  gists_url: string;
  gravatar_id: string | null;
  html_url: string;
  id: number;
  login: string;
  name?: string | null;
  node_id: string;
  organizations_url: string;
  received_events_url: string;
  repos_url: string;
  site_admin: boolean;
  starred_at?: string;
  starred_url: string;
  subscriptions_url: string;
  type: string;
  url: string;
  user_view_type?: string;
}

export interface Head {
  label: string;
  ref: string;
  /**
   * A repository on GitHub.
   */
  repo: HeadRepo;
  sha: string;
  user: HeadSimpleUser | null;
}

/**
 * A repository on GitHub.
 */
export interface HeadRepo {
  /**
   * Whether to allow Auto-merge to be used on pull requests.
   */
  allow_auto_merge?: boolean;
  /**
   * Whether to allow forking this repo
   */
  allow_forking?: boolean;
  /**
   * Whether to allow merge commits for pull requests.
   */
  allow_merge_commit?: boolean;
  /**
   * Whether to allow rebase merges for pull requests.
   */
  allow_rebase_merge?: boolean;
  /**
   * Whether to allow squash merges for pull requests.
   */
  allow_squash_merge?: boolean;
  /**
   * Whether or not a pull request head branch that is behind its base branch can always be
   * updated even if it is not required to be up to date before merging.
   */
  allow_update_branch?: boolean;
  /**
   * Whether anonymous git access is enabled for this repository
   */
  anonymous_access_enabled?: boolean;
  archive_url: string;
  /**
   * Whether the repository is archived.
   */
  archived: boolean;
  assignees_url: string;
  blobs_url: string;
  branches_url: string;
  clone_url: string;
  /**
   * The status of the code search index for this repository
   */
  code_search_index_status?: FluffyCodeSearchIndexStatus;
  collaborators_url: string;
  comments_url: string;
  commits_url: string;
  compare_url: string;
  contents_url: string;
  contributors_url: string;
  created_at: Date | null;
  /**
   * The default branch of the repository.
   */
  default_branch: string;
  /**
   * Whether to delete head branches when pull requests are merged
   */
  delete_branch_on_merge?: boolean;
  deployments_url: string;
  description: string | null;
  /**
   * Returns whether or not this repository disabled.
   */
  disabled: boolean;
  downloads_url: string;
  events_url: string;
  fork: boolean;
  forks: number;
  forks_count: number;
  forks_url: string;
  full_name: string;
  git_commits_url: string;
  git_refs_url: string;
  git_tags_url: string;
  git_url: string;
  /**
   * Whether discussions are enabled.
   */
  has_discussions?: boolean;
  /**
   * Whether downloads are enabled.
   */
  has_downloads: boolean;
  /**
   * Whether issues are enabled.
   */
  has_issues: boolean;
  has_pages: boolean;
  /**
   * Whether projects are enabled.
   */
  has_projects: boolean;
  /**
   * Whether the wiki is enabled.
   */
  has_wiki: boolean;
  homepage: string | null;
  hooks_url: string;
  html_url: string;
  /**
   * Unique identifier of the repository
   */
  id: number;
  /**
   * Whether this repository acts as a template that can be used to generate new repositories.
   */
  is_template?: boolean;
  issue_comment_url: string;
  issue_events_url: string;
  issues_url: string;
  keys_url: string;
  labels_url: string;
  language: string | null;
  languages_url: string;
  license: FluffyLicenseSimple | null;
  master_branch?: string;
  /**
   * The default value for a merge commit message.
   *
   * - `PR_TITLE` - default to the pull request's title.
   * - `PR_BODY` - default to the pull request's body.
   * - `BLANK` - default to a blank commit message.
   */
  merge_commit_message?: MergeCommitMessage;
  /**
   * The default value for a merge commit title.
   *
   * - `PR_TITLE` - default to the pull request's title.
   * - `MERGE_MESSAGE` - default to the classic title for a merge message (e.g., Merge pull
   * request #123 from branch-name).
   */
  merge_commit_title?: MergeCommitTitle;
  merges_url: string;
  milestones_url: string;
  mirror_url: string | null;
  /**
   * The name of the repository.
   */
  name: string;
  node_id: string;
  notifications_url: string;
  open_issues: number;
  open_issues_count: number;
  /**
   * A GitHub user.
   */
  owner: StickySimpleUser;
  permissions?: FluffyPermissions;
  /**
   * Whether the repository is private or public.
   */
  private: boolean;
  pulls_url: string;
  pushed_at: Date | null;
  releases_url: string;
  /**
   * The size of the repository, in kilobytes. Size is calculated hourly. When a repository is
   * initially created, the size is 0.
   */
  size: number;
  /**
   * The default value for a squash merge commit message:
   *
   * - `PR_BODY` - default to the pull request's body.
   * - `COMMIT_MESSAGES` - default to the branch's commit messages.
   * - `BLANK` - default to a blank commit message.
   */
  squash_merge_commit_message?: SquashMergeCommitMessage;
  /**
   * The default value for a squash merge commit title:
   *
   * - `PR_TITLE` - default to the pull request's title.
   * - `COMMIT_OR_PR_TITLE` - default to the commit's title (if only one commit) or the pull
   * request's title (when more than one commit).
   */
  squash_merge_commit_title?: SquashMergeCommitTitle;
  ssh_url: string;
  stargazers_count: number;
  stargazers_url: string;
  starred_at?: string;
  statuses_url: string;
  subscribers_url: string;
  subscription_url: string;
  svn_url: string;
  tags_url: string;
  teams_url: string;
  temp_clone_token?: string;
  topics?: string[];
  trees_url: string;
  updated_at: Date | null;
  url: string;
  /**
   * Whether a squash merge commit can use the pull request title as default. **This property
   * is closing down. Please use `squash_merge_commit_title` instead.
   */
  use_squash_pr_title_as_default?: boolean;
  /**
   * The repository visibility: public, private, or internal.
   */
  visibility?: string;
  watchers: number;
  watchers_count: number;
  /**
   * Whether to require contributors to sign off on web-based commits
   */
  web_commit_signoff_required?: boolean;
}

/**
 * The status of the code search index for this repository
 */
export interface FluffyCodeSearchIndexStatus {
  lexical_commit_sha?: string;
  lexical_search_ok?: boolean;
}

/**
 * License Simple
 */
export interface FluffyLicenseSimple {
  html_url?: string;
  key: string;
  name: string;
  node_id: string;
  spdx_id: string | null;
  url: string | null;
}

/**
 * A GitHub user.
 */
export interface StickySimpleUser {
  avatar_url: string;
  email?: string | null;
  events_url: string;
  followers_url: string;
  following_url: string;
  gists_url: string;
  gravatar_id: string | null;
  html_url: string;
  id: number;
  login: string;
  name?: string | null;
  node_id: string;
  organizations_url: string;
  received_events_url: string;
  repos_url: string;
  site_admin: boolean;
  starred_at?: string;
  starred_url: string;
  subscriptions_url: string;
  type: string;
  url: string;
  user_view_type?: string;
}

export interface FluffyPermissions {
  admin: boolean;
  maintain?: boolean;
  pull: boolean;
  push: boolean;
  triage?: boolean;
}

/**
 * A GitHub user.
 */
export interface HeadSimpleUser {
  avatar_url: string;
  email?: string | null;
  events_url: string;
  followers_url: string;
  following_url: string;
  gists_url: string;
  gravatar_id: string | null;
  html_url: string;
  id: number;
  login: string;
  name?: string | null;
  node_id: string;
  organizations_url: string;
  received_events_url: string;
  repos_url: string;
  site_admin: boolean;
  starred_at?: string;
  starred_url: string;
  subscriptions_url: string;
  type: string;
  url: string;
  user_view_type?: string;
}

export interface Label {
  color: string;
  default: boolean;
  description: string;
  id: number;
  name: string;
  node_id: string;
  url: string;
}

/**
 * A collection of related issues and pull requests.
 */
export interface Milestone {
  closed_at: Date | null;
  closed_issues: number;
  created_at: Date;
  creator: MilestoneSimpleUser | null;
  description: string | null;
  due_on: Date | null;
  html_url: string;
  id: number;
  labels_url: string;
  node_id: string;
  /**
   * The number of the milestone.
   */
  number: number;
  open_issues: number;
  /**
   * The state of the milestone.
   */
  state: State;
  /**
   * The title of the milestone.
   */
  title: string;
  updated_at: Date;
  url: string;
}

/**
 * A GitHub user.
 */
export interface MilestoneSimpleUser {
  avatar_url: string;
  email?: string | null;
  events_url: string;
  followers_url: string;
  following_url: string;
  gists_url: string;
  gravatar_id: string | null;
  html_url: string;
  id: number;
  login: string;
  name?: string | null;
  node_id: string;
  organizations_url: string;
  received_events_url: string;
  repos_url: string;
  site_admin: boolean;
  starred_at?: string;
  starred_url: string;
  subscriptions_url: string;
  type: string;
  url: string;
  user_view_type?: string;
}

/**
 * The state of the milestone.
 */
export enum State {
  Closed = 'closed',
  Open = 'open',
}

/**
 * A GitHub user.
 */
export interface RequestedReviewerElement {
  avatar_url: string;
  email?: string | null;
  events_url: string;
  followers_url: string;
  following_url: string;
  gists_url: string;
  gravatar_id: string | null;
  html_url: string;
  id: number;
  login: string;
  name?: string | null;
  node_id: string;
  organizations_url: string;
  received_events_url: string;
  repos_url: string;
  site_admin: boolean;
  starred_at?: string;
  starred_url: string;
  subscriptions_url: string;
  type: string;
  url: string;
  user_view_type?: string;
}

/**
 * Groups of organization members that gives permissions on specified repositories.
 */
export interface Team {
  description: string | null;
  /**
   * Unique identifier of the enterprise to which this team belongs
   */
  enterprise_id?: number;
  html_url: string;
  id: number;
  members_url: string;
  name: string;
  node_id: string;
  notification_setting?: string;
  /**
   * Unique identifier of the organization to which this team belongs
   */
  organization_id?: number;
  parent: TeamSimple | null;
  permission: string;
  permissions?: RequestedTeamPermissions;
  privacy?: string;
  repositories_url: string;
  slug: string;
  /**
   * The ownership type of the team
   */
  type: Type;
  url: string;
}

/**
 * Groups of organization members that gives permissions on specified repositories.
 */
export interface TeamSimple {
  /**
   * Description of the team
   */
  description: string | null;
  /**
   * Unique identifier of the enterprise to which this team belongs
   */
  enterprise_id?: number;
  html_url: string;
  /**
   * Unique identifier of the team
   */
  id: number;
  /**
   * Distinguished Name (DN) that team maps to within LDAP environment
   */
  ldap_dn?: string;
  members_url: string;
  /**
   * Name of the team
   */
  name: string;
  node_id: string;
  /**
   * The notification setting the team has set
   */
  notification_setting?: string;
  /**
   * Unique identifier of the organization to which this team belongs
   */
  organization_id?: number;
  /**
   * Permission that the team will have for its repositories
   */
  permission: string;
  /**
   * The level of privacy this team should have
   */
  privacy?: string;
  repositories_url: string;
  slug: string;
  /**
   * The ownership type of the team
   */
  type: Type;
  /**
   * URL for the team
   */
  url: string;
}

/**
 * The ownership type of the team
 */
export enum Type {
  Enterprise = 'enterprise',
  Organization = 'organization',
}

export interface RequestedTeamPermissions {
  admin: boolean;
  maintain: boolean;
  pull: boolean;
  push: boolean;
  triage: boolean;
}

/**
 * A GitHub user.
 */
export interface FluffySimpleUser {
  avatar_url: string;
  email?: string | null;
  events_url: string;
  followers_url: string;
  following_url: string;
  gists_url: string;
  gravatar_id: string | null;
  html_url: string;
  id: number;
  login: string;
  name?: string | null;
  node_id: string;
  organizations_url: string;
  received_events_url: string;
  repos_url: string;
  site_admin: boolean;
  starred_at?: string;
  starred_url: string;
  subscriptions_url: string;
  type: string;
  url: string;
  user_view_type?: string;
}

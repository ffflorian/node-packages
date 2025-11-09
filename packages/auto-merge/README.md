# auto-merge [![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0) [![npm version](https://img.shields.io/npm/v/@ffflorian/auto-merge.svg?style=flat)](https://www.npmjs.com/package/@ffflorian/auto-merge)

Automatically merge (and optionally approve) all GitHub PRs which match a specific pattern.

## Prerequisites

- [Node.js](https://nodejs.org) >= 14
- npm (preinstalled) or [yarn](https://classic.yarnpkg.com)

## Installation

ℹ️ This is a pure [ESM](https://nodejs.org/api/esm.html#introduction) module.

Run `yarn global add @ffflorian/auto-merge` or `npm i -g @ffflorian/auto-merge`.

## Usage

### CLI

```
Usage: auto-merge [options]

Automatically merge (and optionally approve) all GitHub PRs which match a
specific pattern.

Options:
  -a, --approve        approve before merging
  -c, --config <path>  specify a configuration file (default: .automergerc.json)
  -d, --dry-run        don't send any data
  -f, --merge-drafts   merge draft PRs (default: false)
  -s, --squash         squash when merging (default: false)
  -V, --version        output the version number
  -h, --help           display help for command
```

### Configuration file

To use a configuration file, add a configuration file following the [cosmiconfig standard](https://github.com/davidtheclark/cosmiconfig#cosmiconfig) (e.g. `.automergerc.json`) to your project and the auto-merge will find it automatically. Options from the CLI still take precedence over the configuration file.

The structure of the configuration file is the following:

```ts
{
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
```

If you would like to use a custom configuration file, start the CLI with the option `--config <file>`.

### Configuration file examples

- [JSON configuration example](./.automergerc.example.json)

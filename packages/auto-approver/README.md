# auto-approver [![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0) [![npm version](https://img.shields.io/npm/v/auto-approver.svg?style=flat)](https://www.npmjs.com/package/auto-approver)

Automatically approve all GitHub PRs which match a specific pattern.

## Prerequisites

- [Node.js](https://nodejs.org) >= 14
- npm (preinstalled) or [yarn](https://classic.yarnpkg.com) < 2

## Installation

ℹ️ This is a hybrid [CommonJS](https://nodejs.org/docs/latest/api/modules.html#modules-commonjs-modules) / [ESM](https://nodejs.org/api/esm.html#introduction) module.

Run `yarn global add auto-approver` or `npm i -g auto-approver`.

## Usage

### CLI

```
Usage: auto-approver [options]

Automatically approve all GitHub PRs which match a specific pattern.

Options:
  -m, --message <text>  comment on PRs instead of approving them
  -c, --config <path>   specify a configuration file (default: .approverrc.json)
  -V, --version         output the version number
  -h, --help            display help for command
```

### Configuration file

To use a configuration file, add a configuration file following the [cosmiconfig standard](https://github.com/davidtheclark/cosmiconfig#cosmiconfig) (e.g. `.approverrc.json`) to your project and the auto-approver will find it automatically. Options from the CLI still take precedence over the configuration file.

The structure of the configuration file is the following:

```ts
{
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
```

If you would like to use a custom configuration file, start the CLI with the option `--config <file>`.

### Configuration file examples

- [JSON configuration example](./.approverrc.example.json)

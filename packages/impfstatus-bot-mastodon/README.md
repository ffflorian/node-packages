# mastodon-bot-impfstatus [![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)

Toots Germany's COVID-19 vaccination progress to Mastodon.

Currently deployed to [@impfstatus@botsin.space](https://botsin.space/@impfstatus).

```
▓▓▓▓▓▓▓▓▓▓▓▓░░░ 77,9% mind. eine Impfdosis
▓▓▓▓▓▓▓▓▓▓▓░░░░ 76,3% grundimmunisiert
▓▓▓▓▓▓▓▓▓░░░░░░ 62,4% erste Auffrischimpfung
▓▓░░░░░░░░░░░░░ 13,3% zweite Auffrischimpfung
```

## Prerequisites

- [Node.js](https://nodejs.org) >= 10.9
- [yarn](https://classic.yarnpkg.com)

## Installation

```
yarn
```

## Usage

```
yarn start
```

## CLI usage

```
Usage: impfstatus [options]

Toots Germany's COVID-19 vaccination progress to Mastodon.

Options:
  -V, --version        output the version number
  -s, --server <host>  Specify a Mastodon server (e.g. https://mastodon.social)
  -t, --token <token>  Specify an access token
  -d, --dry-run        Do not actually send data or write config file
  -c, --config <file>  Specify a config file
  -f, --force          Force sending toot
  -h, --help           display help for command
```

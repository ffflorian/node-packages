# @ffflorian/semantic-release-config [![npm version](https://img.shields.io/npm/v/@ffflorian/semantic-release-config.svg)](https://npmjs.com/package/@ffflorian/semantic-release-config)

Shared semantic-release configuration for Node.js packages.

## Exported Configs

- Default export: `defaultConfig`
- Named export: `multiPackageConfig`
- Named export: `defaultConfig`

## Release Notes

Releases are triggered only by `feat`, `fix`, `perf` and breaking-change commits (Angular rules), but the release notes list all conventional commit types since the last release (`chore`, `refactor`, `docs`, `ci`, etc.).

## Installation

```bash
yarn add -D semantic-release @semantic-release/changelog @semantic-release/git @ffflorian/semantic-release-config
```

## Usage

Use the default single-package config in `package.json`:

```json
{
  "release": {
    "extends": "@ffflorian/semantic-release-config"
  },
  "scripts": {
    "release": "semantic-release"
  }
}
```

Use a named export in `release.config.mjs`:

```js
import {multiPackageConfig} from '@ffflorian/semantic-release-config';

export default multiPackageConfig;
```

## GitHub Actions Example

```yaml
jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: yarn --immutable
      - name: Release
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: yarn release
```

## Notes

- The configs target the `main` branch.
- `singlePackageConfig` and `multiPackageConfig` both include `@semantic-release/git` updates for `package.json` and `CHANGELOG.md`.

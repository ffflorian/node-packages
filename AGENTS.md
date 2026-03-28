# AGENTS.md

This file contains knowledge and conventions for AI agents working in this repository. Always add new knowledge to this file when discovered.

## Project Overview

This is a Yarn workspaces monorepo managed by [Lerna](https://lerna.js.org/), containing multiple independently published Node.js/TypeScript packages by [Florian Imdahl](https://github.com/ffflorian).

- **License**: GPL-3.0
- **Node.js requirement**: >= 18.0 (CI uses Node.js 24.x)
- **Package manager**: Yarn 4.12.0 (Berry)

## Packages

| Package | npm name | Description |
| --- | --- | --- |
| `api-client` | `@ffflorian/api-client` | Simple API client using the Fetch API (pure ESM) |
| `auto-merge` | `@ffflorian/auto-merge` | GitHub auto-merge tool |
| `crates-updater` | `crates-updater` | Rust crates dependency updater |
| `double-linked-list` | (unpublished) | Double linked list data structure |
| `electron-icon-generator` | `@ffflorian/electron-icon-generator` | Generate icons for Electron apps |
| `electron-info` | `electron-info` | Retrieve Electron release information |
| `exposure-keys` | `exposure-keys` | Exposure keys tooling |
| `gh-open` | `@ffflorian/gh-open` | Open GitHub URLs from the terminal |
| `https-proxy` | `@ffflorian/https-proxy` | HTTPS proxy utility |
| `jszip-cli` | `@ffflorian/jszip-cli` | CLI for creating/extracting ZIP archives via jszip |
| `mastodon-bot-yearprogress` | (unpublished) | Mastodon bot for year progress updates |
| `mock-udp` | `@ffflorian/mock-udp` | Mock UDP socket for testing |
| `my-timezone` | `my-timezone` | Timezone utility |
| `ntfy` | `ntfy` | Send notifications via ntfy |
| `ntpclient` | `ntpclient` | NTP client |
| `pixelflut` | `pixelflut` | Pixelflut client |
| `publish-flat` | `publish-flat` | Publish npm packages with a flat directory structure |
| `quick-sort` | (unpublished) | Quick sort algorithm implementation |
| `scrabble-cheater` | `scrabble-cheater` | Scrabble word finder |
| `which-os` | `which-os` | Detect operating system |
| `windows-shortcut-maker` | `@ffflorian/windows-shortcut-maker` | Create Windows shortcuts |

## Development

### Package Manager

**Always use `yarn`. Never use `npm`.**

```sh
yarn install          # Install dependencies
yarn build:ts         # Build all packages (concurrency 4)
yarn lint             # Lint all (prettier + oxlint + eslint)
yarn fix              # Auto-fix linting issues
yarn test             # Run all tests
yarn dist             # Clean + build
```

### Adding dependencies

```sh
yarn workspace @ffflorian/<package-name> add <dep>
yarn workspace @ffflorian/<package-name> add -D <dep>
```

### Per-package scripts

Each package supports `build`, `clean`, and `test` scripts run via Lerna.

## Tooling

- **Build**: TypeScript (`tsc`) via per-package `tsconfig.build.json`
- **Bundler**: Vite (used in some packages)
- **Testing**: Vitest
- **Linting**: oxlint + ESLint with `@ffflorian/eslint-config`, run in that order
- **Formatting**: Prettier with `@ffflorian/prettier-config`
- **Git hooks**: Lefthook (`lefthook.yml`) — runs prettier, oxlint, and eslint with auto-fix on staged files before commit
- **Versioning**: Lerna independent versioning with conventional commits
- **Publishing**: Lerna publishes to npm registry; only allowed from `main` branch

## Commit Messages

Use **semantic / conventional commit messages**:

```
feat: add new feature
fix: fix a bug
chore: maintenance or dependency updates
docs: documentation changes
refactor: code restructuring without behavior change
test: add or update tests
build: build system changes
ci: CI/CD configuration changes
```

- Do **not** include references to Claude or AI tools in commit messages or PR descriptions.
- Lerna uses conventional commits to determine version bumps and generate changelogs.

## Branch Naming

Use **semantic branch names**:

```
feat/<short-description>
fix/<short-description>
chore/<short-description>
docs/<short-description>
refactor/<short-description>
```

## CI/CD

GitHub Actions workflow (`.github/workflows/build_test_publish.yml`):

1. Runs on pushes and PRs to `main`
2. Steps: install (`yarn --immutable`), build, lint, test
3. On push to `main` (non-`chore` commits): publishes changed packages to npm via `yarn release`

## Code Style

- All packages are **ESM** (pure ES modules)
- TypeScript throughout; each package has `tsconfig.json` (dev) and `tsconfig.build.json` (production)
- ESLint config: `@ffflorian/eslint-config` with oxlint pre-pass
- Prettier config: `@ffflorian/prettier-config`
- `eslint.config.ts` excludes `packages/exposure-keys/proto/**`
- `.yarnrc.yml`: `nodeLinker: node-modules`, no semver range prefix, public npm access

## Before Committing

Always run `yarn fix` before committing to auto-fix linting and formatting errors:

```sh
yarn fix
```

This runs prettier (formatting) and oxlint + eslint (linting) with auto-fix across the codebase.

## PR Guidelines

- Do **not** add references to Claude or AI tools in PR titles, descriptions, or commit messages.
- Keep PR descriptions focused on what changed and why.

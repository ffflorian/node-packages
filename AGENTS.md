# AGENTS Guide

This file explains how coding agents should work in this repository.

## General

### Approach

- Think before acting. Read existing files before writing code.
- Be concise in output but thorough in reasoning.
- Prefer editing over rewriting whole files.
- Do not re-read files you have already read.
- Test your code before declaring done.
- No sycophantic openers or closing fluff.
- Keep solutions simple and direct.
- User instructions always override this file.

### Output

- Return code first. Explanation after, only if non-obvious.
- No inline prose. Use comments sparingly - only where logic is unclear.
- No boilerplate unless explicitly requested.

### Code Rules

- Simplest working solution. No over-engineering.
- No abstractions for single-use operations.
- No speculative features or "you might also want..."
- Read the file before modifying it. Never edit blind.
- No docstrings or type annotations on code not being changed.
- No error handling for scenarios that cannot happen.
- Three similar lines is better than a premature abstraction.

### Review Rules

- State the bug. Show the fix. Stop.
- No suggestions beyond the scope of the review.
- No compliments on the code before or after the review.

### Debugging Rules

- Never speculate about a bug without reading the relevant code first.
- State what you found, where, and the fix. One pass.
- If cause is unclear: say so. Do not guess.

### Simple Formatting

- No em dashes, smart quotes, or decorative Unicode symbols.
- Plain hyphens and straight quotes only.
- Natural language characters (accented letters, CJK, etc.) are fine when the content requires them.
- Code output must be copy-paste safe.

## Project Overview

This is a yarn workspaces monorepo managed by [multi-semantic-release](https://github.com/dhoulb/multi-semantic-release), containing multiple independently published Node.js/TypeScript packages by [Florian Imdahl](https://github.com/ffflorian).

- **License**: GPL-3.0
- **Node.js requirement**: >= 18.0 (CI uses Node.js 24.x)
- **Package manager**: yarn 4.12.0 (Berry)

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
| `webhook-forwarder` | `webhook-forwarder` | Receive webhooks and forward them to a specific URL (NestJS) |
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

Each package supports `build`, `clean`, and `test` scripts run via `yarn workspaces foreach`.

## Tooling

- **Build**: TypeScript (`tsc`) via per-package `tsconfig.build.json`
- **Bundler**: vite (used in some packages)
- **Testing**: vitest
- **Linting**: oxlint + ESLint with `@ffflorian/eslint-config`, run in that order
- **Formatting**: prettier with `@ffflorian/prettier-config`
- **Git hooks**: lefthook (`lefthook.yml`) — runs prettier, oxlint, and eslint with auto-fix on staged files before commit
- **Versioning**: Independent versioning via conventional commits
- **Publishing**: `multi-semantic-release` (dhoulb) publishes to npm; only packages whose files changed are released. Private packages are excluded via `--ignore-private-packages`. Only allowed from `main` branch.
- **Cross-repo deps**: When a package in this repo depends on another package in this repo, use `*` as the version — multi-semantic-release replaces it with the correct version at publish time.
- **Release config**: Root `.releaserc.json` with explicit plugin list (no `@semantic-release/git`); a single post-release commit is created by CI instead

## Dependencies

**Always use pinned (exact) versions in `package.json`.** Do not use `^`, `~`, or other range specifiers for dependencies. This is enforced by `defaultSemverRangePrefix: ''` in `.yarnrc.yml`.

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
- `multi-semantic-release` uses conventional commits to determine version bumps and generate changelogs.
- Only packages with commits touching their own directory are released — unrelated packages are never published.

## Branch Naming

Use **semantic branch names**:

```
feat/<short-description>
fix/<short-description>
chore/<short-description>
docs/<short-description>
refactor/<short-description>
```

Do **not** include references to Claude, AI agents, or tool-generated identifiers in branch names. Use only the semantic prefix and a short human-readable description of the change.

## CI/CD

GitHub Actions workflow (`.github/workflows/build_test_publish.yml`):

1. Runs on pushes and PRs to `main`
2. Steps: install (`yarn --immutable`), build, lint, test
3. On push to `main`: runs `yarn release` (`multi-semantic-release`) which publishes only changed packages to npm
4. Requires `GITHUB_TOKEN` and OIDC for npm auth; checkout uses `fetch-depth: 0` for full git history

## Code Style

- All packages are **ESM** (pure ES modules)
- TypeScript throughout; each package has `tsconfig.json` (dev) and `tsconfig.build.json` (production)
- ESLint config: `@ffflorian/eslint-config` with oxlint pre-pass
- Prettier config: `@ffflorian/prettier-config`
- `eslint.config.ts` excludes `packages/exposure-keys/proto/**`
- `.yarnrc.yml`: `nodeLinker: node-modules`, no semver range prefix, public npm access

## Before Committing

After implementing any change, always run build and tests to verify correctness:

```sh
yarn build:ts
yarn test
```

Then run `yarn fix` to auto-fix linting and formatting errors before committing:

```sh
yarn fix
```

This runs prettier (formatting) and oxlint + eslint (linting) with auto-fix across the codebase.

## PR Guidelines

- Do **not** add references to Claude or AI tools in PR titles, descriptions, or commit messages.
- Keep PR descriptions focused on what changed and why.

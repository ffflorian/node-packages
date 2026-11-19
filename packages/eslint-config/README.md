# @ffflorian/eslint-config [![npm version](https://img.shields.io/npm/v/@ffflorian/eslint-config.svg)](https://npmjs.com/package/@ffflorian/eslint-config)

Opinionated ESLint flat config for JavaScript and TypeScript projects.

## What Is Included

- ESLint recommended rules
- TypeScript ESLint recommended rules
- Import plugin rules (including TypeScript import resolution)
- oxlint recommended rules
- Perfectionist alphabetical sorting rules
- Browser and Node globals

## Installation

```bash
yarn add -D eslint @ffflorian/eslint-config
```

## Usage

Create or update `eslint.config.ts`:

```ts
import config from '@ffflorian/eslint-config';
import {defineConfig} from 'eslint/config';

export default defineConfig([config]);
```

## Notes

- This package is built for ESLint flat config (`eslint.config.*`).
- The config already includes TypeScript support via `typescript-eslint`.
- If your project uses custom path aliases, ensure your TypeScript config is set up so import resolution works as expected.

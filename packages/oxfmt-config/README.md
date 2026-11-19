# @ffflorian/oxfmt-config [![npm version](https://img.shields.io/npm/v/@ffflorian/oxfmt-config.svg)](https://npmjs.com/package/@ffflorian/oxfmt-config)

Opinionated [oxfmt](https://oxc.rs/docs/guide/usage/formatter.html) config for JavaScript and TypeScript projects.

## What Is Included

- oxfmt rules

## Installation

```bash
yarn add -D oxfmt @ffflorian/oxfmt-config
```

## Usage

Create or update `oxfmt.config.ts`:

```ts
import {defineConfig} from 'oxfmt';

import config from '@ffflorian/oxfmt-config';

export default defineConfig({
  ...config,
  // your rules here
});
```

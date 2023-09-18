# quick-sort [![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)

A TypeScript QuickSort implementation.

## Prerequisites

- [Node.js](https://nodejs.org) >= 14
- npm (preinstalled) or [yarn](https://classic.yarnpkg.com)

## Usage

ℹ️ This is a hybrid [CommonJS](https://nodejs.org/docs/latest/api/modules.html#modules-commonjs-modules) / [ESM](https://nodejs.org/api/esm.html#introduction) module.

```ts
import quickSort from 'quick-sort';

const unsortedArray = [15, 13, 1, 22];
const sortedArray = quickSort.sort(unsortedArray);
// sortedArray === [1, 13, 15, 22]
```

## Tests

```
yarn
yarn test
```

# quick-sort [![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)

A TypeScript QuickSort implementation.

## Usage

```ts
import * as quickSort from 'quick-sort';

const unsortedArray = [15, 13, 1, 22];
const sortedArray = quickSort.sort(unsortedArray);
// sortedArray === [1, 13, 15, 22]
```

## Tests

```
yarn
yarn test
```

# double-linked-list [![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0) [![npm version](https://img.shields.io/npm/v/@ffflorian/doublelinkedlist.svg?style=flat)](https://www.npmjs.com/package/@ffflorian/doublelinkedlist)

A linked list in which every element knows about its predecessor and its successor.

```
 ______     ______     ______
| |  | |   | |  | |   | |  | |
| |  | <---> |  | <---> |  | |
|_|__|_|   |_|__|_|   |_|__|_|
  prev        n         next
```

## Prerequisites

- [Node.js](https://nodejs.org) >= 14
- npm (preinstalled) or [yarn](https://classic.yarnpkg.com)

## Installation

ℹ️ This is a pure [ESM](https://nodejs.org/api/esm.html#introduction) module.

Run `yarn add @ffflorian/doublelinkedlist` or `npm i @ffflorian/doublelinkedlist`.

### Usage

```ts
import {LinkedList} from '@ffflorian/doublelinkedlist';

const list = new LinkedList();
list.add('one');
list.add('two');
list.add('three');
list.get(0); // 'one'
```

The full API documentation is available at https://ffflorian.github.io/DoubleLinkedList.

### Testing

First, install the needed packages for testing:

```
yarn
```

Now run the tests:

```
yarn test
```

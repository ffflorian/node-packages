## DoubleLinkedList [![npm version](https://img.shields.io/npm/v/@ffflorian/doublelinkedlist.svg?style=flat)](https://www.npmjs.com/package/@ffflorian/doublelinkedlist)

A linked list in which every element knows about its predecessor and its successor.

```
 ______     ______     ______
| |  | |   | |  | |   | |  | |
| |  | <---> |  | <---> |  | |
|_|__|_|   |_|__|_|   |_|__|_|
  prev        n         next
```

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

# file-index [![npm version](https://img.shields.io/npm/v/@ffflorian/file-index.svg?style=flat)](https://www.npmjs.com/package/@ffflorian/file-index)

Generate a file index.

## Installation

Run `yarn add @ffflorian/file-index` or `npm install @ffflorian/file-index`.

## Usage

**Definition**

```ts
function generateIndex(directory: string): Promise<DirEntry>;
function generateIndexSync(directory: string): DirEntry;

interface FileEntry {
  fullPath: string;
  name: string;
  size: number;
  type: 'file';
}

interface LinkEntry {
  fullPath: string;
  name: string;
  type: 'link';
}

interface DirEntry extends Entry {
  directories: {[name: string]: DirEntry};
  files: {[name: string]: FileEntry};
  links: {[name: string]: LinkEntry};
  type: 'directory';
}
```

**YourFile.ts**

```ts
import {generateIndex} from '@ffflorian/file-index';

generateIndex('./')
  .then(index => {
    // see result
  })
  .catch(error => console.error(error));

generateIndex('./', 5) // with depth of 5
  .then(index => {
    // see result
  })
  .catch(error => console.error(error));
```

**Result**

```js
{
  directories: {
    '.github': {
      directories: {},
      files: {
        'main.workflow': {
          fullPath: '/home/user/file-index/.github/main.workflow',
          name: 'main.workflow',
          size: 1369,
          type: 'file',
        },
      },
      fullPath: '/home/user/file-index/.github/',
      links: {},
      name: '.github',
      type: 'directory',
    },
    dist: {
      directories: {},
      files: {
        'fileIndex.d.ts': {
          fullPath: '/home/user/file-index/dist/fileIndex.d.ts',
          name: 'fileIndex.d.ts',
          size: 190,
          type: 'file',
        },
        // ...
      },
      fullPath: '/home/user/file-index/dist/',
      links: {},
      name: 'dist',
      type: 'directory',
    },
    src: {
      directories: {},
      files: {
        'FileIndex.ts': {
          fullPath: '/home/user/file-index/src/FileIndex.ts',
          name: 'FileIndex.ts',
          size: 2635,
          type: 'file',
        },
        // ...
      },
      fullPath: '/home/user/file-index/src/',
      links: {},
      name: 'src',
      type: 'directory',
    },
    // ...
  },
  fullPath: '/home/user/file-index/',
  links: {},
  name: 'file-index',
  type: 'directory',
}
```

# publish-flat [![npm version](https://img.shields.io/npm/v/publish-flat.svg?style=flat)](https://www.npmjs.com/package/publish-flat)

Publish your project flattened. No more `dist` in `require('project/dist/Options')`.

## Description

Here is what it does:

1. Copies your dist files together with the other release files into a temporary directory
2. Aligns your `package.json` to work with the flattened structure
3. Publishes your project from the temporary directory (optional)

### Example

#### Before

##### Directory structure of the published project:

```
.
├── dist
│   ├── index.d.ts
│   ├── index.js
│   ├── index.js.map
│   ├── Options.d.ts
│   ├── Options.js
│   └── Options.js.map
└── package.json
```

##### In other people's code:

```ts
import {Options} from 'project/dist/Options';
```

#### After

##### Directory structure of the published project:

```
.
├── index.d.ts
├── index.js
├── index.js.map
├── Options.d.ts
├── Options.js
├── Options.js.map
└── package.json
```

##### In other people's code:

```ts
import {Options} from 'project/Options';
```

## Installation

```
yarn add publish-flat
```

## CLI Usage

```
Usage: publish-flat [options] [dir]

Publish your project without the dist directory

Options:
  -V, --version        output the version number
  -y, --yarn           Use yarn for publishing (default: false)
  -f, --flatten <dir>  Which directory to flatten (default: "dist")
  -o, --output <dir>   Set the output directory (default: temp directory)
  -p, --publish        Publish (default: false)
  -h, --help           output usage information
```

## API Usage

See [`cli.ts`](./src/cli.ts).

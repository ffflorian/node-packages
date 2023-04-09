# mock-udp [![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0) [![npm version](https://img.shields.io/npm/v/@ffflorian/mock-udp.svg?style=flat)](https://www.npmjs.com/package/@ffflorian/mock-udp)

Mock dgram udp requests. Based on [node-mock-udp](https://github.com/mattrobenolt/node-mock-udp).

## Prerequisites

- [Node.js](https://nodejs.org) >= 14
- npm (preinstalled) or [yarn](https://classic.yarnpkg.com) < 2

## Installation

ℹ️ This is a hybrid [CommonJS](https://nodejs.org/docs/latest/api/modules.html#modules-commonjs-modules) / [ESM](https://nodejs.org/api/esm.html#introduction) module.

Run `yarn add @ffflorian/mock-udp` or `npm i @ffflorian/mock-udp`.

## Usage

```ts
import dgram from 'node:dgram';
import mockudp from '@ffflorian/mock-udp';
// When imported, Socket gets patched immediately.

// Create scope to capture UDP requests
const scope = mockudp('localhost:1234');

const client = dgram.createSocket('udp4');
const message = Buffer.from('hello world');

client.send(message, 0, message.length, 1234, 'localhost', (err, bytes) => {
  scope.buffer; // the buffer which would have been sent
  scope.done(); // will return `true` if the scope was used, otherwise `false`.
});
```

# ntfy [![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0) [![npm version](https://img.shields.io/npm/v/ntfy.svg?style=flat)](https://www.npmjs.com/package/ntfy)

Send notifications over [ntfy.sh](https://ntfy.sh).

## Prerequisites

- [Node.js](https://nodejs.org) >= 14
- npm (preinstalled) or [yarn](https://classic.yarnpkg.com)

## Installation

ℹ️ This is a hybrid [CommonJS](https://nodejs.org/docs/latest/api/modules.html#modules-commonjs-modules) / [ESM](https://nodejs.org/api/esm.html#introduction) module.

Run `yarn add ntfy` or `npm i ntfy`.

## Usage

### Simple example

```ts
import {publish} from 'ntfy';

await publish({
  message: 'This is an example message.',
  topic: 'mytopic',
});
```

### Advanced example

```ts
import {publish, MessagePriority} from 'ntfy';

await publish({
  actions: [
    {
      clear: true,
      extras: {
        cmd: 'pic',
        camera: 'front',
      },
      intent: 'io.heckel.ntfy.USER_ACTION',
      label: 'Take picture',
      type: 'broadcast',
    },
    {
      body: '{"action": "close"}',
      clear: false,
      headers: {
        Authorization: 'Bearer zAzsx1sk..',
      },
      label: 'Close door',
      method: 'PUT',
      type: 'http',
      url: 'https://api.mygarage.lan',
    },
    {
      clear: true,
      label: 'Open portal',
      type: 'view',
      url: 'https://api.nest.com/',
    },
  ],
  authorization: {
    password: 'my-password',
    username: 'my-username',
  },
  clickURL: 'https://github.com/ffflorian/',
  delay: '1m',
  disableCache: true,
  disableFirebase: true,
  emailAddress: 'name@example.com',
  iconURL: 'https://avatars.githubusercontent.com/ffflorian',
  message: 'Remote access to device detected. Act right away.',
  priority: MessagePriority.MAX,
  server: 'https://ntfy.custom',
  tags: ['warning', 'skull'],
  title: 'Unauthorized access detected',
  topic: 'mytopic',
});
```

### Use a custom server without specifying it every time

```ts
import {NtfyClient} from 'ntfy';
const ntfyClient = new NtfyClient('https://ntfy.custom');

await ntfyClient.publish({ ... });
await ntfyClient.publish({ ... });
```

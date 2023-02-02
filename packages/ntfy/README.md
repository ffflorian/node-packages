# ntfy [![npm version](https://img.shields.io/npm/v/ntfy.svg?style=flat)](https://www.npmjs.com/package/ntfy)

Send notifications over [ntfy.sh](https://ntfy.sh).

## Installation

```
npm install ntfy
```

```
yarn add ntft
```

## Usage

### Simple example

```ts
import {publish} from 'ntfy';

await ntfyClient.publish({
  message: 'This is an example message.',
  topic: 'mytopic',
});
```

### Advanced example

```ts
import {publish, MessagePriority} from 'ntfy';

await ntfyClient.publish({
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

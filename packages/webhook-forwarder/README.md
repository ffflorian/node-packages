# webhook-forwarder [![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)

Receive webhooks and forward them to a specific URL. Built with [NestJS](https://nestjs.com/).

## Installation

```
npm install -g webhook-forwarder
```

## Usage

### CLI

```
Usage: webhook-forwarder [options]

Receive webhooks and forward them to a specific URL.

Options:
  -H, --host <host>          set the host to listen on (default: "0.0.0.0", env: WEBHOOK_FORWARDER_HOST)
  -p, --port <port>          set the port to listen on (default: 8080, env: WEBHOOK_FORWARDER_PORT)
  -t, --target <url>         set a target URL for a single-route setup (env: WEBHOOK_FORWARDER_TARGET)
  -P, --path <path>          set the path for a single-route setup (default: "/")
  -T, --timeout <ms>         set the forwarding request timeout in ms (default: 30000, env: WEBHOOK_FORWARDER_TIMEOUT)
  -c, --config <path>        use a configuration file
  --noconfig                 don't look for a configuration file
  -v, --version              output the version number
  -h, --help                 display help for command
```

### Environment variables

| Variable                    | Description                       | Default   |
| --------------------------- | --------------------------------- | --------- |
| `WEBHOOK_FORWARDER_HOST`    | Host to listen on                 | `0.0.0.0` |
| `WEBHOOK_FORWARDER_PORT`    | Port to listen on                 | `8080`    |
| `WEBHOOK_FORWARDER_TARGET`  | Target URL for single-route setup | (none)    |
| `WEBHOOK_FORWARDER_TIMEOUT` | Forwarding request timeout in ms  | `30000`   |

### Configuration file

webhook-forwarder uses [cosmiconfig](https://github.com/cosmiconfig/cosmiconfig) for configuration file support. It will search for a configuration file named `.webhook-forwarderrc.json`, `.webhook-forwarderrc.yml`, `webhook-forwarder.config.js`, etc.

Example `.webhook-forwarderrc.json`:

```json
{
  "host": "0.0.0.0",
  "port": 8080,
  "routes": [
    {
      "path": "/github",
      "target": "https://example.com/hooks/github"
    },
    {
      "path": "/gitlab",
      "target": "https://example.com/hooks/gitlab",
      "timeout": 60000
    }
  ]
}
```

Each route maps a webhook path to a target URL. You can optionally set a per-route `timeout`.

### Programmatic

```typescript
import {WebhookForwarder} from 'webhook-forwarder';

const forwarder = new WebhookForwarder({
  host: '0.0.0.0',
  port: 8080,
  routes: [
    {path: '/github', target: 'https://example.com/hooks/github'},
    {path: '/gitlab', target: 'https://example.com/hooks/gitlab'},
  ],
  timeout: 30000,
});

await forwarder.start();
```

## License

GPL-3.0

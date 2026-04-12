# webhook-forwarder [![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)

Receive webhooks and forward them to a specific URL.

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
  -t, --target <url>         set the target URL to forward webhooks to (env: WEBHOOK_FORWARDER_TARGET)
  -P, --path <path>          set the path to listen on (default: "/", env: WEBHOOK_FORWARDER_PATH)
  -T, --timeout <ms>         set the forwarding request timeout in ms (default: 30000, env: WEBHOOK_FORWARDER_TIMEOUT)
  -v, --version              output the version number
  -h, --help                 display help for command
```

### Environment variables

| Variable | Description | Default |
| --- | --- | --- |
| `WEBHOOK_FORWARDER_HOST` | Host to listen on | `0.0.0.0` |
| `WEBHOOK_FORWARDER_PORT` | Port to listen on | `8080` |
| `WEBHOOK_FORWARDER_TARGET` | Target URL to forward webhooks to | (none) |
| `WEBHOOK_FORWARDER_PATH` | Path to listen on | `/` |
| `WEBHOOK_FORWARDER_TIMEOUT` | Forwarding request timeout in ms | `30000` |

### Programmatic

```typescript
import {WebhookForwarder} from 'webhook-forwarder';

const forwarder = new WebhookForwarder({
  host: '0.0.0.0',
  port: 8080,
  targetUrl: 'https://example.com/webhook',
  path: '/',
  timeout: 30000,
});

forwarder.start();
```

## License

GPL-3.0

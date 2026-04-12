import logdown from 'logdown';
import http from 'node:http';

import type {WebhookForwarderOptions} from './interfaces.js';

const defaultOptions = {
  host: '0.0.0.0',
  path: '/',
  port: 8080,
  timeout: 30000,
};

export class WebhookForwarder {
  private readonly logger: logdown.Logger;
  private readonly options: Required<WebhookForwarderOptions>;
  private server: http.Server | null = null;

  constructor(options: WebhookForwarderOptions) {
    this.options = {...defaultOptions, ...options};
    this.logger = logdown('webhook-forwarder', {
      logger: console,
      markdown: false,
    });
    this.logger.state.isEnabled = true;
  }

  start(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.server = http.createServer(this.onRequest);
      this.server.on('error', (error: Error) => {
        this.logger.error(`Server error: "${error.message}"`);
        reject(error);
      });
      this.server.listen(this.options.port, this.options.host, () => {
        this.logger.info(
          `Webhook forwarder listening on http://${this.options.host}:${this.options.port}${this.options.path}`
        );
        this.logger.info(`Forwarding to ${this.options.targetUrl}`);
        resolve();
      });
    });
  }

  stop(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.server) {
        resolve();
        return;
      }
      this.server.close(error => {
        if (error) {
          reject(error);
        } else {
          this.server = null;
          this.logger.info('Server stopped.');
          resolve();
        }
      });
    });
  }

  private collectBody(req: http.IncomingMessage): Promise<string> {
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      req.on('data', (chunk: Buffer) => chunks.push(chunk));
      req.on('end', () => resolve(Buffer.concat(chunks).toString()));
      req.on('error', reject);
    });
  }

  private readonly onRequest = async (req: http.IncomingMessage, res: http.ServerResponse): Promise<void> => {
    const requestPath = req.url || '/';

    if (this.options.path !== '/' && requestPath !== this.options.path) {
      res.writeHead(404, {'Content-Type': 'text/plain'});
      res.end('Not Found');
      return;
    }

    try {
      const body = await this.collectBody(req);
      const headers: Record<string, string> = {};

      for (const [key, value] of Object.entries(req.headers)) {
        if (value && key.toLowerCase() !== 'host' && key.toLowerCase() !== 'content-length') {
          headers[key] = Array.isArray(value) ? value.join(', ') : value;
        }
      }

      this.logger.info(`Received ${req.method} ${requestPath} (${body.length} bytes)`);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.options.timeout);

      try {
        const response = await fetch(this.options.targetUrl, {
          body: body || undefined,
          headers,
          method: req.method || 'POST',
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        this.logger.info(`Forwarded to ${this.options.targetUrl} - response: ${response.status}`);

        const responseBody = await response.text();

        res.writeHead(response.status, {'Content-Type': response.headers.get('content-type') || 'text/plain'});
        res.end(responseBody);
      } catch (error) {
        clearTimeout(timeoutId);

        if ((error as Error).name === 'AbortError') {
          this.logger.error(`Request to ${this.options.targetUrl} timed out`);
          res.writeHead(504, {'Content-Type': 'text/plain'});
          res.end('Gateway Timeout');
        } else {
          throw error;
        }
      }
    } catch (error) {
      this.logger.error(`Error forwarding webhook: "${(error as Error).message}"`);
      res.writeHead(502, {'Content-Type': 'text/plain'});
      res.end('Bad Gateway');
    }
  };
}

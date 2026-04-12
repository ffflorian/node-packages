import {HttpStatus, Injectable} from '@nestjs/common';
import logdown from 'logdown';

import type {Route} from './interfaces.js';

const defaultTimeout = 30000;

@Injectable()
export class ForwarderService {
  private readonly logger = logdown('webhook-forwarder/service', {
    logger: console,
    markdown: false,
  });

  private routes: Route[] = [];
  private timeout = defaultTimeout;

  constructor() {
    this.logger.state.isEnabled = true;
  }

  configure(routes: Route[], timeout: number): void {
    this.routes = routes;
    this.timeout = timeout;
  }

  findRoute(path: string): Route | undefined {
    return this.routes.find(route => path === route.path);
  }

  async forward(
    route: Route,
    method: string,
    headers: Record<string, string>,
    body: string
  ): Promise<{body: string; contentType: string; status: number}> {
    const timeout = route.timeout ?? this.timeout;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(route.target, {
        body: body || undefined,
        headers,
        method,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      this.logger.info(`Forwarded to ${route.target} - response: ${response.status}`);

      const responseBody = await response.text();
      return {
        body: responseBody,
        contentType: response.headers.get('content-type') || 'text/plain',
        status: response.status,
      };
    } catch (error) {
      clearTimeout(timeoutId);

      if ((error as Error).name === 'AbortError') {
        this.logger.error(`Request to ${route.target} timed out`);
        return {body: 'Gateway Timeout', contentType: 'text/plain', status: HttpStatus.GATEWAY_TIMEOUT};
      }

      this.logger.error(`Error forwarding webhook: "${(error as Error).message}"`);
      return {body: 'Bad Gateway', contentType: 'text/plain', status: HttpStatus.BAD_GATEWAY};
    }
  }
}

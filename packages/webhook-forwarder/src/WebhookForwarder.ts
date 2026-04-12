import {NestFactory} from '@nestjs/core';
import logdown from 'logdown';

import type {WebhookForwarderOptions} from './interfaces.js';

import {AppModule} from './app.module.js';
import {loadConfig} from './config.js';
import {ForwarderService} from './forwarder.service.js';

const defaultHost = '0.0.0.0';
const defaultPort = 8080;
const defaultTimeout = 30000;

export class WebhookForwarder {
  private app: Awaited<ReturnType<typeof NestFactory.create>> | null = null;
  private readonly logger: logdown.Logger;
  private readonly options: Pick<WebhookForwarderOptions, 'routes'> &
    Required<Pick<WebhookForwarderOptions, 'host' | 'port' | 'timeout'>>;

  constructor(options?: WebhookForwarderOptions) {
    this.logger = logdown('webhook-forwarder', {
      logger: console,
      markdown: false,
    });
    this.logger.state.isEnabled = true;

    const configFileData = options?.configFile !== false ? loadConfig(options?.configFile) : undefined;

    this.options = {
      host: options?.host ?? configFileData?.host ?? defaultHost,
      port: options?.port ?? configFileData?.port ?? defaultPort,
      routes: options?.routes ?? configFileData?.routes ?? [],
      timeout: options?.timeout ?? defaultTimeout,
    };
  }

  async start(): Promise<void> {
    const routes = this.options.routes ?? [];

    if (routes.length === 0) {
      throw new Error('No routes configured. Provide routes via CLI, config file, or constructor options.');
    }

    this.app = await NestFactory.create(AppModule, {
      bodyParser: false,
      logger: false,
    });

    const forwarderService = this.app.get(ForwarderService);
    forwarderService.configure(routes, this.options.timeout);

    await this.app.listen(this.options.port, this.options.host);

    this.logger.info(`Webhook forwarder listening on http://${this.options.host}:${this.options.port}`);
    for (const route of routes) {
      this.logger.info(`  ${route.path} -> ${route.target}`);
    }
  }

  async stop(): Promise<void> {
    if (this.app) {
      await this.app.close();
      this.app = null;
      this.logger.info('Server stopped.');
    }
  }
}

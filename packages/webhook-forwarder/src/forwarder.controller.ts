import type {NextFunction, Request, Response} from 'express';

import {HttpStatus, Injectable, NestMiddleware} from '@nestjs/common';
import logdown from 'logdown';
import {createHmac, timingSafeEqual} from 'node:crypto';

import {ForwarderService} from './forwarder.service.js';

@Injectable()
export class ForwarderMiddleware implements NestMiddleware {
  private readonly logger = logdown('webhook-forwarder/middleware', {
    logger: console,
    markdown: false,
  });

  constructor(private readonly forwarderService: ForwarderService) {
    this.logger.state.isEnabled = true;
  }

  async use(req: Request, res: Response, _next: NextFunction): Promise<void> {
    const requestPath = req.originalUrl || req.path || '/';
    const route = this.forwarderService.findRoute(requestPath);

    if (!route) {
      res.status(HttpStatus.NOT_FOUND).type('text/plain').send('Not Found');
      return;
    }

    const body = await this.collectBody(req);

    if (route.secret) {
      const signatureHeader = req.headers['x-hub-signature-256'] as string | undefined;
      if (!signatureHeader) {
        this.logger.warn(`Missing X-Hub-Signature-256 header for ${requestPath}`);
        res.status(HttpStatus.UNAUTHORIZED).type('text/plain').send('Missing signature');
        return;
      }

      const expectedSignature = `sha256=${createHmac('sha256', route.secret).update(body).digest('hex')}`;
      const expected = Buffer.from(expectedSignature);
      const received = Buffer.from(signatureHeader);

      if (expected.length !== received.length || !timingSafeEqual(expected, received)) {
        this.logger.warn(`Invalid signature for ${requestPath}`);
        res.status(HttpStatus.UNAUTHORIZED).type('text/plain').send('Invalid signature');
        return;
      }
    }

    const forwardHeaders: Record<string, string> = {};
    for (const [key, value] of Object.entries(req.headers)) {
      const lowerKey = key.toLowerCase();
      if (
        value &&
        lowerKey !== 'host' &&
        lowerKey !== 'content-length' &&
        lowerKey !== 'transfer-encoding' &&
        lowerKey !== 'connection'
      ) {
        forwardHeaders[key] = Array.isArray(value) ? value.join(', ') : value;
      }
    }

    this.logger.info(`Received ${req.method} ${requestPath} (${body.length} bytes)`);

    const result = await this.forwarderService.forward(route, req.method, forwardHeaders, body);

    res.status(result.status).type(result.contentType).send(result.body);
  }

  private collectBody(req: Request): Promise<string> {
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      req.on('data', (chunk: Buffer) => chunks.push(chunk));
      req.on('end', () => resolve(Buffer.concat(chunks).toString()));
      req.on('error', reject);
    });
  }
}

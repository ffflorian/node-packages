import {MiddlewareConsumer, Module, NestModule} from '@nestjs/common';

import {ForwarderMiddleware} from './forwarder.controller.js';
import {ForwarderService} from './forwarder.service.js';

@Module({
  providers: [ForwarderService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(ForwarderMiddleware).forRoutes('*');
  }
}

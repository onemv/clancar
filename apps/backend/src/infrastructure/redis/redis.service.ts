import { Injectable, Inject, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly client: Redis;

  constructor(
    @Inject(ConfigService)
    configService: ConfigService
  ) {
    this.client = new Redis(configService.get<string>('redis.url') ?? '', {
      lazyConnect: true,
      maxRetriesPerRequest: 1
    });

    // In local dev Redis may be intentionally absent; health checks should report "down"
    // without crashing the whole backend process on ioredis error events.
    this.client.on('error', () => undefined);
  }

  async ping(): Promise<boolean> {
    const response = await this.client.ping();
    return response === 'PONG';
  }

  async onModuleDestroy() {
    if (this.client.status !== 'end') {
      this.client.disconnect();
    }
  }
}

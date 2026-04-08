import { Injectable, Inject } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { RedisService } from '../../infrastructure/redis/redis.service';
import { StorageService } from '../../infrastructure/storage/storage.service';
import type { HealthResponse } from '../../common/types/health.types';

@Injectable()
export class HealthService {
  constructor(
    @Inject(PrismaService)
    private readonly prismaService: PrismaService,
    @Inject(RedisService)
    private readonly redisService: RedisService,
    @Inject(StorageService)
    private readonly storageService: StorageService
  ) {}

  async check(): Promise<HealthResponse> {
    const [database, redis, storage] = await Promise.all([
      this.checkDependency(() => this.prismaService.ping()),
      this.checkDependency(() => this.redisService.ping()),
      this.checkDependency(() => this.storageService.ping())
    ]);

    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      dependencies: {
        database,
        redis,
        storage
      }
    };
  }

  private async checkDependency(ping: () => Promise<boolean>) {
    try {
      return (await ping()) ? 'up' : 'down';
    } catch {
      return 'down';
    }
  }
}

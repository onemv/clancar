import { Injectable, Inject, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleDestroy {
  private connected = false;

  constructor(
    @Inject(ConfigService)
    configService: ConfigService
  ) {
    super({
      datasources: {
        db: {
          url: configService.get<string>('database.url') ?? ''
        }
      }
    });
  }

  async ping(): Promise<boolean> {
    if (!this.connected) {
      await this.$connect();
      this.connected = true;
    }

    await this.$queryRawUnsafe('SELECT 1');
    return true;
  }

  async onModuleDestroy() {
    if (this.connected) {
      await this.$disconnect();
      this.connected = false;
    }
  }
}

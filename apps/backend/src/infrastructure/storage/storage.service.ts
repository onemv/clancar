import { Injectable, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  ListBucketsCommand
} from '@aws-sdk/client-s3';
import type { StorageConfig } from './storage.types';

@Injectable()
export class StorageService {
  private readonly client: S3Client;

  constructor(
    @Inject(ConfigService)
    configService: ConfigService
  ) {
    const config = configService.get<StorageConfig>('storage') ?? {
      endpoint: '',
      region: 'us-east-1',
      accessKeyId: '',
      secretAccessKey: '',
      bucket: '',
      forcePathStyle: true
    };

    this.client = new S3Client({
      region: config.region,
      endpoint: config.endpoint,
      forcePathStyle: config.forcePathStyle,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey
      }
    });
  }

  async ping(): Promise<boolean> {
    await this.client.send(new ListBucketsCommand({}));
    return true;
  }
}

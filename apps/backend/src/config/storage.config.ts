import { registerAs } from '@nestjs/config';

export const storageConfig = registerAs('storage', () => ({
  endpoint: process.env.S3_ENDPOINT ?? '',
  region: process.env.S3_REGION ?? 'us-east-1',
  accessKeyId: process.env.S3_ACCESS_KEY ?? '',
  secretAccessKey: process.env.S3_SECRET_KEY ?? '',
  bucket: process.env.S3_BUCKET ?? '',
  forcePathStyle: (process.env.S3_FORCE_PATH_STYLE ?? 'true').toLowerCase() === 'true',
  publicBaseUrl: process.env.S3_PUBLIC_BASE_URL
}));

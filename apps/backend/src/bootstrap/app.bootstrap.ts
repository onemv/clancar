import type { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export function configureApplication(app: INestApplication) {
  const configService = app.get(ConfigService);
  const apiPrefix = configService.get<string>('app.apiPrefix', 'api');

  app.setGlobalPrefix(apiPrefix);
  app.enableCors({
    origin: true,
    credentials: true
  });
}

import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { configureApplication } from './bootstrap/app.bootstrap';
import { createOpenApiDocument, registerOpenApiRoutes } from './bootstrap/swagger';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log']
  });

  configureApplication(app);

  const document = createOpenApiDocument(app);
  registerOpenApiRoutes(app, document);

  const configService = app.get(ConfigService);
  const port = configService.get<number>('app.port', 8000);

  await app.listen(port);
}

bootstrap().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

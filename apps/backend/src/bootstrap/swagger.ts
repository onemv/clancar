import type { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export function createOpenApiDocument(app: INestApplication) {
  const documentBuilder = new DocumentBuilder()
    .setTitle('ClanCarAuction API')
    .setDescription('API for the ClanCarAuction backend')
    .setVersion('1.0.0')
    .addServer('/api');

  return SwaggerModule.createDocument(app, documentBuilder.build(), {
    deepScanRoutes: true
  });
}

export function registerOpenApiRoutes(
  app: INestApplication,
  document: ReturnType<typeof createOpenApiDocument>
) {
  SwaggerModule.setup('docs', app, document, {
    useGlobalPrefix: true,
    customSiteTitle: 'ClanCarAuction API',
    jsonDocumentUrl: 'openapi.json'
  });

  const httpAdapter = app.getHttpAdapter();
  const instance = httpAdapter.getInstance();

  instance.get('/api/openapi.json', (_request: unknown, response: { json: (value: unknown) => void }) => {
    response.json(document);
  });
}

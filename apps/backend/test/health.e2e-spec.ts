import request from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { configureApplication } from '../src/bootstrap/app.bootstrap';
import { createOpenApiDocument, registerOpenApiRoutes } from '../src/bootstrap/swagger';
import { PrismaService } from '../src/infrastructure/prisma/prisma.service';
import { RedisService } from '../src/infrastructure/redis/redis.service';
import { StorageService } from '../src/infrastructure/storage/storage.service';

Object.assign(process.env, {
  NODE_ENV: 'test',
  PORT: '8000',
  API_PREFIX: 'api',
  DATABASE_URL: 'postgresql://clancar:clancar@localhost:5432/clancar',
  REDIS_URL: 'redis://localhost:6380',
  S3_ENDPOINT: 'http://localhost:9000',
  S3_REGION: 'us-east-1',
  S3_ACCESS_KEY: 'minio',
  S3_SECRET_KEY: 'miniosecret',
  S3_BUCKET: 'clancar-dev',
  S3_FORCE_PATH_STYLE: 'true',
  S3_PUBLIC_BASE_URL: 'http://localhost:9000/clancar-dev'
});

describe('Backend smoke', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule]
    })
      .overrideProvider(PrismaService)
      .useValue({
        ping: async () => true
      })
      .overrideProvider(RedisService)
      .useValue({
        ping: async () => true
      })
      .overrideProvider(StorageService)
      .useValue({
        ping: async () => true
      })
      .compile();

    app = moduleRef.createNestApplication();
    configureApplication(app);

    const document = createOpenApiDocument(app);
    registerOpenApiRoutes(app, document);

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('returns health status on /api/health', async () => {
    await request(app.getHttpServer())
      .get('/api/health')
      .expect(200)
      .expect(({ body }) => {
        expect(body.status).toBe('ok');
        expect(body.dependencies.database).toBe('up');
        expect(body.dependencies.redis).toBe('up');
        expect(body.dependencies.storage).toBe('up');
      });
  });

  it('serves openapi json on /api/openapi.json', async () => {
    await request(app.getHttpServer())
      .get('/api/openapi.json')
      .expect(200)
      .expect(({ body }) => {
        expect(body.openapi).toBeDefined();
      });
  });
});

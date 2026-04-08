import { writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { configureApplication } from '../src/bootstrap/app.bootstrap';
import { createOpenApiDocument } from '../src/bootstrap/swagger';

async function main() {
  const app = await NestFactory.create(AppModule, {
    logger: false
  });

  configureApplication(app);

  const document = createOpenApiDocument(app);
  const outputPath = resolve(__dirname, '../openapi/schema.json');

  await writeFile(outputPath, `${JSON.stringify(document, null, 2)}\n`, 'utf8');
  await app.close();
}

main().catch((error) => {
  // Keep the export script explicit: fail fast and non-zero on schema issues.
  console.error(error);
  process.exitCode = 1;
});

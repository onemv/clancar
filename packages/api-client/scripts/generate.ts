import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';
import openapiTS from 'openapi-typescript';
import { openApiConfig } from '../openapi.config';

const schemaPath = openApiConfig.schemaPath;
const outputPath = openApiConfig.outputPath;

async function main() {
  const rawSchema = await readFile(schemaPath, 'utf8');
  const source = await openapiTS(JSON.parse(rawSchema), {
    alphabetize: true,
    exportType: true
  });

  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(
    outputPath,
    [
      '/* This file is generated from apps/backend/openapi/schema.json. */',
      source.toString(),
      ''
    ].join('\n'),
    'utf8'
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

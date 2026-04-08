import { resolve } from 'node:path';

export const openApiConfig = {
  schemaPath: resolve(__dirname, '../../apps/backend/openapi/schema.json'),
  outputPath: resolve(__dirname, 'src/generated/schema.ts')
} as const;

export interface EnvironmentVariables {
  NODE_ENV: string;
  PORT: number;
  API_PREFIX: string;
  DATABASE_URL: string;
  REDIS_URL: string;
  S3_ENDPOINT: string;
  S3_REGION: string;
  S3_ACCESS_KEY: string;
  S3_SECRET_KEY: string;
  S3_BUCKET: string;
  S3_FORCE_PATH_STYLE: boolean;
  S3_PUBLIC_BASE_URL?: string;
}

function requireString(name: string, value: unknown) {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`Missing or invalid env var: ${name}`);
  }

  return value.trim();
}

function parseBoolean(value: unknown, fallback: boolean) {
  if (value === undefined) {
    return fallback;
  }

  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'string') {
    return value.toLowerCase() === 'true';
  }

  return fallback;
}

function parsePort(value: unknown, fallback: number) {
  if (value === undefined || value === null || value === '') {
    return fallback;
  }

  const port = Number(value);

  if (!Number.isInteger(port) || port <= 0) {
    throw new Error('Missing or invalid env var: PORT');
  }

  return port;
}

export function validateEnv(env: Record<string, unknown>): EnvironmentVariables {
  return {
    NODE_ENV: typeof env.NODE_ENV === 'string' ? env.NODE_ENV : 'development',
    PORT: parsePort(env.PORT, 8000),
    API_PREFIX: typeof env.API_PREFIX === 'string' && env.API_PREFIX.trim().length > 0 ? env.API_PREFIX.trim() : 'api',
    DATABASE_URL: requireString('DATABASE_URL', env.DATABASE_URL),
    REDIS_URL: requireString('REDIS_URL', env.REDIS_URL),
    S3_ENDPOINT: requireString('S3_ENDPOINT', env.S3_ENDPOINT),
    S3_REGION: requireString('S3_REGION', env.S3_REGION),
    S3_ACCESS_KEY: requireString('S3_ACCESS_KEY', env.S3_ACCESS_KEY),
    S3_SECRET_KEY: requireString('S3_SECRET_KEY', env.S3_SECRET_KEY),
    S3_BUCKET: requireString('S3_BUCKET', env.S3_BUCKET),
    S3_FORCE_PATH_STYLE: parseBoolean(env.S3_FORCE_PATH_STYLE, true),
    S3_PUBLIC_BASE_URL: typeof env.S3_PUBLIC_BASE_URL === 'string' && env.S3_PUBLIC_BASE_URL.trim().length > 0 ? env.S3_PUBLIC_BASE_URL.trim() : undefined
  };
}

export interface HealthResponse {
  status: 'ok';
  timestamp: string;
  dependencies: {
    database: 'up' | 'down';
    redis: 'up' | 'down';
    storage: 'up' | 'down';
  };
}

export interface ApiClientOptions {
  baseUrl?: string;
  fetchFn?: typeof fetch;
  headers?: HeadersInit;
}

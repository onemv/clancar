import type { ApiClientOptions, HealthResponse } from './types';

type FetchFn = typeof fetch;

export interface ApiClient {
  health: {
    get(): Promise<HealthResponse>;
  };
  request<T>(path: string, init?: RequestInit): Promise<T>;
}

function normalizeBaseUrl(baseUrl: string): string {
  const trimmed = baseUrl.trim();
  return trimmed.endsWith('/') ? trimmed.slice(0, -1) : trimmed;
}

function normalizePath(path: string): string {
  return path.startsWith('/') ? path : `/${path}`;
}

export function createApiClient(options: ApiClientOptions = {}): ApiClient {
  const baseUrl = normalizeBaseUrl(options.baseUrl ?? '/api');
  const fetchFn = options.fetchFn ?? globalThis.fetch.bind(globalThis);
  const headers = options.headers;

  async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const normalizedPath = normalizePath(path);
    const requestHeaders = new Headers(headers);

    if (init.headers) {
      new Headers(init.headers).forEach((value, key) => {
        requestHeaders.set(key, value);
      });
    }

    requestHeaders.set('Accept', 'application/json');

    const response = await fetchFn(`${baseUrl}${normalizedPath}`, {
      ...init,
      headers: requestHeaders
    });

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    return (await response.json()) as T;
  }

  return {
    health: {
      get: () => request<HealthResponse>(normalizePath('health'))
    },
    request
  };
}

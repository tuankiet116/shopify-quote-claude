interface ApiErrorBody {
  readonly error?: { readonly message?: string };
}

async function getSessionToken(): Promise<string> {
  if (!window.shopify) {
    throw new Error('Shopify App Bridge not initialized');
  }
  return window.shopify.idToken();
}

function buildUrl(path: string): string {
  const url = `/api/shopify/${path}`;
  if (import.meta.env.DEV) {
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}scope=developer`;
  }
  return url;
}

async function fetchApi<T = unknown>(path: string, options: RequestInit = {}): Promise<T> {
  const url = buildUrl(path);

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...((options.headers as Record<string, string>) ?? {}),
  };

  if (!import.meta.env.DEV) {
    const token = await getSessionToken();
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, { ...options, headers });

  if (response.status === 401 && !import.meta.env.DEV) {
    const newToken = await getSessionToken();
    headers['Authorization'] = `Bearer ${newToken}`;
    const retryResponse = await fetch(url, { ...options, headers });
    if (!retryResponse.ok) {
      throw new Error(`API error: ${retryResponse.status}`);
    }
    return retryResponse.json() as Promise<T>;
  }

  if (!response.ok) {
    const error: ApiErrorBody = await response.json().catch((): ApiErrorBody => ({}));
    throw new Error(error?.error?.message ?? `API error: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export function apiGet<T = unknown>(path: string): Promise<T> {
  return fetchApi<T>(path);
}

export function apiPost<T = unknown>(path: string, data?: unknown): Promise<T> {
  return fetchApi<T>(path, {
    method: 'POST',
    body: data ? JSON.stringify(data) : undefined,
  });
}

export function apiPut<T = unknown>(path: string, data?: unknown): Promise<T> {
  return fetchApi<T>(path, {
    method: 'PUT',
    body: data ? JSON.stringify(data) : undefined,
  });
}

export function apiDelete<T = unknown>(path: string): Promise<T> {
  return fetchApi<T>(path, { method: 'DELETE' });
}

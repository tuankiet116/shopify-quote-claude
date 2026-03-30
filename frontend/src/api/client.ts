async function getSessionToken(): Promise<string> {
  const shopify = (window as any).shopify;
  if (!shopify) {
    throw new Error('Shopify App Bridge not initialized');
  }
  return await shopify.idToken();
}

async function fetchApi(path: string, options: RequestInit = {}): Promise<any> {
  let url = `/api/shopify/${path}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  };

  if (import.meta.env.DEV) {
    // Developer mode: bypass auth, append scope=developer
    const separator = url.includes('?') ? '&' : '?';
    url = `${url}${separator}scope=developer`;
  } else {
    // Embedded mode: use Shopify App Bridge token
    const token = await getSessionToken();
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, { ...options, headers });

  if (response.status === 401 && !import.meta.env.DEV) {
    // Token expired, retry with fresh token
    const newToken = await getSessionToken();
    const retryResponse = await fetch(`/api/shopify/${path}`, {
      ...options,
      headers: { ...headers, Authorization: `Bearer ${newToken}` },
    });
    if (!retryResponse.ok) {
      throw new Error(`API error: ${retryResponse.status}`);
    }
    return retryResponse.json();
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error?.error?.message || `API error: ${response.status}`);
  }

  return response.json();
}

export function apiGet(path: string) {
  return fetchApi(path);
}

export function apiPost(path: string, data?: any) {
  return fetchApi(path, {
    method: 'POST',
    body: data ? JSON.stringify(data) : undefined,
  });
}

export function apiPut(path: string, data?: any) {
  return fetchApi(path, {
    method: 'PUT',
    body: data ? JSON.stringify(data) : undefined,
  });
}

export function apiDelete(path: string) {
  return fetchApi(path, { method: 'DELETE' });
}

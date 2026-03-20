async function getSessionToken(): Promise<string> {
    // App Bridge 4 CDN auto-injects and provides shopify global
    const shopify = (window as any).shopify;
    if (!shopify) {
        throw new Error('Shopify App Bridge not initialized');
    }
    return await shopify.idToken();
}

async function fetchApi(path: string, options: RequestInit = {}): Promise<any> {
    const token = await getSessionToken();
    const url = `/api/shopify/${path}`;

    const response = await fetch(url, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
            ...(options.headers || {}),
        },
    });

    if (response.status === 401) {
        // Token expired, try to get a new one
        const newToken = await getSessionToken();
        const retryResponse = await fetch(url, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${newToken}`,
                'Accept': 'application/json',
                ...(options.headers || {}),
            },
        });
        if (!retryResponse.ok) {
            throw new Error(`API error: ${retryResponse.status}`);
        }
        return retryResponse.json();
    }

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || `API error: ${response.status}`);
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

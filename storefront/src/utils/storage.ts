const STORAGE_KEY = 'shopify_quote_cart';

export function getStoredItems<T>(key: string = STORAGE_KEY): T | null {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    } catch {
        return null;
    }
}

export function setStoredItems<T>(data: T, key: string = STORAGE_KEY): void {
    try {
        localStorage.setItem(key, JSON.stringify(data));
    } catch {
        // localStorage full or unavailable
    }
}

export function clearStoredItems(key: string = STORAGE_KEY): void {
    try {
        localStorage.removeItem(key);
    } catch {
        // ignore
    }
}

import { useState, useEffect, useCallback } from 'react';
import { apiGet } from '../api/client';

interface UseAppQueryResult<T> {
    readonly data: T | null;
    readonly loading: boolean;
    readonly error: string | null;
    readonly refetch: () => void;
}

export function useAppQuery<T>(url: string): UseAppQueryResult<T> {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await apiGet<T>(url);
            setData(result);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'An error occurred';
            setError(message);
        } finally {
            setLoading(false);
        }
    }, [url]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return { data, loading, error, refetch: fetchData };
}

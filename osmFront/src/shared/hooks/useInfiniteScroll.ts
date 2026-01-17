// shared/hooks/useInfiniteScroll.ts
/**
 * Infinite Scroll Hook
 * خطاف التمرير اللانهائي
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

interface UseInfiniteScrollOptions<T> {
    fetchData: (page: number) => Promise<{
        data: T[];
        hasMore: boolean;
        total?: number;
    }>;
    initialPage?: number;
    threshold?: number; // Distance from bottom to trigger load (px)
    enabled?: boolean;
}

interface UseInfiniteScrollReturn<T> {
    data: T[];
    loading: boolean;
    loadingMore: boolean;
    error: string | null;
    hasMore: boolean;
    total: number | null;
    page: number;
    loadMore: () => void;
    refresh: () => void;
    reset: () => void;
    observerRef: (node: Element | null) => void;
}

export function useInfiniteScroll<T>({
    fetchData,
    initialPage = 1,
    threshold = 100,
    enabled = true,
}: UseInfiniteScrollOptions<T>): UseInfiniteScrollReturn<T> {
    const [data, setData] = useState<T[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasMore, setHasMore] = useState(true);
    const [total, setTotal] = useState<number | null>(null);
    const [page, setPage] = useState(initialPage);

    const observer = useRef<IntersectionObserver | null>(null);
    const loadingRef = useRef(false);

    // Fetch initial data
    const fetchInitial = useCallback(async () => {
        if (!enabled) return;

        setLoading(true);
        setError(null);

        try {
            const result = await fetchData(initialPage);
            setData(result.data);
            setHasMore(result.hasMore);
            setTotal(result.total ?? null);
            setPage(initialPage);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'حدث خطأ أثناء تحميل البيانات');
        } finally {
            setLoading(false);
        }
    }, [fetchData, initialPage, enabled]);

    // Load more data
    const loadMore = useCallback(async () => {
        if (loadingRef.current || !hasMore || !enabled) return;

        loadingRef.current = true;
        setLoadingMore(true);
        setError(null);

        try {
            const nextPage = page + 1;
            const result = await fetchData(nextPage);

            setData(prev => [...prev, ...result.data]);
            setHasMore(result.hasMore);
            setTotal(result.total ?? null);
            setPage(nextPage);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'حدث خطأ أثناء تحميل المزيد');
        } finally {
            setLoadingMore(false);
            loadingRef.current = false;
        }
    }, [fetchData, hasMore, page, enabled]);

    // Refresh data
    const refresh = useCallback(() => {
        setData([]);
        setPage(initialPage);
        setHasMore(true);
        fetchInitial();
    }, [fetchInitial, initialPage]);

    // Reset state
    const reset = useCallback(() => {
        setData([]);
        setLoading(true);
        setLoadingMore(false);
        setError(null);
        setHasMore(true);
        setTotal(null);
        setPage(initialPage);
    }, [initialPage]);

    // Intersection Observer callback
    const observerRef = useCallback((node: Element | null) => {
        if (loading || loadingMore) return;

        if (observer.current) {
            observer.current.disconnect();
        }

        observer.current = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore && !loadingRef.current) {
                    loadMore();
                }
            },
            { rootMargin: `${threshold}px` }
        );

        if (node) {
            observer.current.observe(node);
        }
    }, [loading, loadingMore, hasMore, loadMore, threshold]);

    // Initial fetch
    useEffect(() => {
        fetchInitial();
    }, [fetchInitial]);

    // Cleanup observer
    useEffect(() => {
        return () => {
            if (observer.current) {
                observer.current.disconnect();
            }
        };
    }, []);

    return {
        data,
        loading,
        loadingMore,
        error,
        hasMore,
        total,
        page,
        loadMore,
        refresh,
        reset,
        observerRef,
    };
}

// Hook for scroll position detection
export function useScrollPosition(threshold = 100) {
    const [nearBottom, setNearBottom] = useState(false);
    const [scrollY, setScrollY] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            const scrollTop = window.scrollY;
            const scrollHeight = document.documentElement.scrollHeight;
            const clientHeight = window.innerHeight;

            setScrollY(scrollTop);
            setNearBottom(scrollHeight - scrollTop - clientHeight < threshold);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [threshold]);

    return { nearBottom, scrollY };
}

export default useInfiniteScroll;

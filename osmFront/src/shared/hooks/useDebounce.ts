// shared/hooks/useDebounce.ts
/**
 * Debounce & Throttle Hooks
 * خطافات التأخير والتحكم في معدل التنفيذ
 */

'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';

/**
 * Debounce a value
 * تأخير تحديث القيمة
 */
export function useDebounce<T>(value: T, delay: number = 500): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(timer);
        };
    }, [value, delay]);

    return debouncedValue;
}

/**
 * Debounced callback
 * تأخير تنفيذ الدالة
 */
export function useDebouncedCallback<T extends (...args: unknown[]) => unknown>(
    callback: T,
    delay: number = 500
): (...args: Parameters<T>) => void {
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const debouncedCallback = useCallback(
        (...args: Parameters<T>) => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }

            timeoutRef.current = setTimeout(() => {
                callback(...args);
            }, delay);
        },
        [callback, delay]
    );

    // Cleanup
    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    return debouncedCallback;
}

/**
 * Throttled callback
 * تحديد معدل تنفيذ الدالة
 */
export function useThrottledCallback<T extends (...args: unknown[]) => unknown>(
    callback: T,
    delay: number = 200
): (...args: Parameters<T>) => void {
    const lastCallRef = useRef<number>(0);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const throttledCallback = useCallback(
        (...args: Parameters<T>) => {
            const now = Date.now();
            const timeSinceLastCall = now - lastCallRef.current;

            if (timeSinceLastCall >= delay) {
                lastCallRef.current = now;
                callback(...args);
            } else {
                // Schedule for the remaining time
                if (timeoutRef.current) {
                    clearTimeout(timeoutRef.current);
                }
                timeoutRef.current = setTimeout(() => {
                    lastCallRef.current = Date.now();
                    callback(...args);
                }, delay - timeSinceLastCall);
            }
        },
        [callback, delay]
    );

    // Cleanup
    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    return throttledCallback;
}

/**
 * Debounced search with loading state
 * بحث مؤخر مع حالة التحميل
 */
export function useDebouncedSearch(delay: number = 300) {
    const [searchTerm, setSearchTerm] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const debouncedSearchTerm = useDebounce(searchTerm, delay);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const handleSearch = useCallback((value: string) => {
        setSearchTerm(value);
        setIsTyping(true);

        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(() => {
            setIsTyping(false);
        }, delay);
    }, [delay]);

    const clearSearch = useCallback(() => {
        setSearchTerm('');
        setIsTyping(false);
    }, []);

    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    return {
        searchTerm,
        debouncedSearchTerm,
        isTyping,
        handleSearch,
        clearSearch,
    };
}

export default useDebounce;

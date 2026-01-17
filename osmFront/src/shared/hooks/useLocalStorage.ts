// shared/hooks/useLocalStorage.ts
/**
 * Local Storage Hook with SSR support
 * خطاف التخزين المحلي مع دعم SSR
 */

'use client';

import { useState, useEffect, useCallback } from 'react';

type SetValue<T> = React.Dispatch<React.SetStateAction<T>>;

/**
 * Custom hook for localStorage with SSR safety
 */
export function useLocalStorage<T>(
    key: string,
    initialValue: T
): [T, SetValue<T>, () => void] {
    // State to store our value
    const [storedValue, setStoredValue] = useState<T>(initialValue);
    const [isInitialized, setIsInitialized] = useState(false);

    // Initialize from localStorage on mount
    useEffect(() => {
        if (typeof window === 'undefined') return;

        try {
            const item = window.localStorage.getItem(key);
            if (item) {
                setStoredValue(JSON.parse(item));
            }
        } catch (error) {
            console.warn(`Error reading localStorage key "${key}":`, error);
        }
        setIsInitialized(true);
    }, [key]);

    // Save to localStorage whenever value changes
    useEffect(() => {
        if (!isInitialized || typeof window === 'undefined') return;

        try {
            window.localStorage.setItem(key, JSON.stringify(storedValue));
        } catch (error) {
            console.warn(`Error setting localStorage key "${key}":`, error);
        }
    }, [key, storedValue, isInitialized]);

    // Remove from localStorage
    const removeValue = useCallback(() => {
        try {
            if (typeof window !== 'undefined') {
                window.localStorage.removeItem(key);
            }
            setStoredValue(initialValue);
        } catch (error) {
            console.warn(`Error removing localStorage key "${key}":`, error);
        }
    }, [key, initialValue]);

    return [storedValue, setStoredValue, removeValue];
}

/**
 * Session Storage Hook
 */
export function useSessionStorage<T>(
    key: string,
    initialValue: T
): [T, SetValue<T>, () => void] {
    const [storedValue, setStoredValue] = useState<T>(initialValue);
    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
        if (typeof window === 'undefined') return;

        try {
            const item = window.sessionStorage.getItem(key);
            if (item) {
                setStoredValue(JSON.parse(item));
            }
        } catch (error) {
            console.warn(`Error reading sessionStorage key "${key}":`, error);
        }
        setIsInitialized(true);
    }, [key]);

    useEffect(() => {
        if (!isInitialized || typeof window === 'undefined') return;

        try {
            window.sessionStorage.setItem(key, JSON.stringify(storedValue));
        } catch (error) {
            console.warn(`Error setting sessionStorage key "${key}":`, error);
        }
    }, [key, storedValue, isInitialized]);

    const removeValue = useCallback(() => {
        try {
            if (typeof window !== 'undefined') {
                window.sessionStorage.removeItem(key);
            }
            setStoredValue(initialValue);
        } catch (error) {
            console.warn(`Error removing sessionStorage key "${key}":`, error);
        }
    }, [key, initialValue]);

    return [storedValue, setStoredValue, removeValue];
}

/**
 * Cache with expiration
 * تخزين مؤقت مع انتهاء الصلاحية
 */
interface CacheItem<T> {
    value: T;
    expiry: number;
}

export function useCachedValue<T>(
    key: string,
    initialValue: T,
    ttlMinutes: number = 60
): [T, (value: T) => void, () => void, boolean] {
    const [value, setValue] = useState<T>(initialValue);
    const [isExpired, setIsExpired] = useState(false);

    // Load from cache
    useEffect(() => {
        if (typeof window === 'undefined') return;

        try {
            const item = window.localStorage.getItem(`cache_${key}`);
            if (item) {
                const cached: CacheItem<T> = JSON.parse(item);
                if (cached.expiry > Date.now()) {
                    setValue(cached.value);
                    setIsExpired(false);
                } else {
                    // Expired
                    window.localStorage.removeItem(`cache_${key}`);
                    setIsExpired(true);
                }
            }
        } catch (error) {
            console.warn(`Error reading cache key "${key}":`, error);
        }
    }, [key]);

    // Update cache
    const updateCache = useCallback((newValue: T) => {
        setValue(newValue);
        setIsExpired(false);

        if (typeof window !== 'undefined') {
            const item: CacheItem<T> = {
                value: newValue,
                expiry: Date.now() + ttlMinutes * 60 * 1000,
            };
            window.localStorage.setItem(`cache_${key}`, JSON.stringify(item));
        }
    }, [key, ttlMinutes]);

    // Clear cache
    const clearCache = useCallback(() => {
        setValue(initialValue);
        if (typeof window !== 'undefined') {
            window.localStorage.removeItem(`cache_${key}`);
        }
    }, [key, initialValue]);

    return [value, updateCache, clearCache, isExpired];
}

export default useLocalStorage;

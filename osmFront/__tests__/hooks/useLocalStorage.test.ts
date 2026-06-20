// __tests__/hooks/useLocalStorage.test.ts
/**
 * Tests for useLocalStorage hooks
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import {
    useLocalStorage,
    useSessionStorage,
    useCachedValue
} from '@/src/shared/hooks/useLocalStorage';

describe('useLocalStorage', () => {
    beforeEach(() => {
        localStorage.clear();
        vi.clearAllMocks();
    });

    it('should return initial value when localStorage is empty', () => {
        const { result } = renderHook(() => useLocalStorage('test-key', 'default'));
        expect(result.current[0]).toBe('default');
    });

    it('should update value in localStorage', async () => {
        const { result } = renderHook(() => useLocalStorage('test-key', 'initial'));

        act(() => {
            result.current[1]('new value');
        });

        expect(result.current[0]).toBe('new value');
    });

    it('should handle objects', () => {
        const initialValue = { name: 'test', count: 0 };
        const { result } = renderHook(() => useLocalStorage('test-obj', initialValue));

        act(() => {
            result.current[1]({ name: 'updated', count: 1 });
        });

        expect(result.current[0]).toEqual({ name: 'updated', count: 1 });
    });

    it('should handle arrays', () => {
        const { result } = renderHook(() => useLocalStorage<string[]>('test-arr', []));

        act(() => {
            result.current[1](['a', 'b', 'c']);
        });

        expect(result.current[0]).toEqual(['a', 'b', 'c']);
    });

    it('should remove value from localStorage', () => {
        const { result } = renderHook(() => useLocalStorage('test-key', 'initial'));

        act(() => {
            result.current[1]('stored');
        });

        expect(result.current[0]).toBe('stored');

        act(() => {
            result.current[2](); // removeValue
        });

        expect(result.current[0]).toBe('initial');
    });

    it('should handle function updates', () => {
        const { result } = renderHook(() => useLocalStorage('counter', 0));

        act(() => {
            result.current[1](prev => prev + 1);
        });

        expect(result.current[0]).toBe(1);

        act(() => {
            result.current[1](prev => prev + 5);
        });

        expect(result.current[0]).toBe(6);
    });
});

describe('useSessionStorage', () => {
    beforeEach(() => {
        sessionStorage.clear();
        vi.clearAllMocks();
    });

    it('should work similarly to localStorage', () => {
        const { result } = renderHook(() => useSessionStorage('session-key', 'default'));

        expect(result.current[0]).toBe('default');

        act(() => {
            result.current[1]('session value');
        });

        expect(result.current[0]).toBe('session value');
    });
});

describe('useCachedValue', () => {
    beforeEach(() => {
        localStorage.clear();
        vi.clearAllMocks();
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('should return initial value when cache is empty', () => {
        const { result } = renderHook(() => useCachedValue('cache-key', 'initial', 60));

        expect(result.current[0]).toBe('initial');
        expect(result.current[3]).toBe(false); // isExpired
    });

    it('should update cache with TTL', () => {
        const { result } = renderHook(() => useCachedValue('cache-key', 'initial', 60));

        act(() => {
            result.current[1]('cached value'); // updateCache
        });

        expect(result.current[0]).toBe('cached value');
    });

    it('should clear cache', () => {
        const { result } = renderHook(() => useCachedValue('cache-key', 'initial', 60));

        act(() => {
            result.current[1]('cached');
        });

        expect(result.current[0]).toBe('cached');

        act(() => {
            result.current[2](); // clearCache
        });

        expect(result.current[0]).toBe('initial');
    });
});

// __tests__/hooks/useDebounce.test.ts
/**
 * Tests for useDebounce hooks
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import {
    useDebounce,
    useDebouncedCallback,
    useThrottledCallback,
    useDebouncedSearch
} from '@/src/shared/hooks/useDebounce';

describe('useDebounce', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('should return initial value immediately', () => {
        const { result } = renderHook(() => useDebounce('initial', 500));
        expect(result.current).toBe('initial');
    });

    it('should debounce value changes', async () => {
        const { result, rerender } = renderHook(
            ({ value }) => useDebounce(value, 500),
            { initialProps: { value: 'initial' } }
        );

        // Change value
        rerender({ value: 'changed' });

        // Value should not change immediately
        expect(result.current).toBe('initial');

        // Fast-forward time
        act(() => {
            vi.advanceTimersByTime(500);
        });

        // Now value should be updated
        expect(result.current).toBe('changed');
    });

    it('should reset timer on rapid changes', () => {
        const { result, rerender } = renderHook(
            ({ value }) => useDebounce(value, 500),
            { initialProps: { value: 'a' } }
        );

        // Rapid changes
        rerender({ value: 'b' });
        act(() => vi.advanceTimersByTime(200));

        rerender({ value: 'c' });
        act(() => vi.advanceTimersByTime(200));

        rerender({ value: 'd' });

        // Should still be 'a'
        expect(result.current).toBe('a');

        // Complete the delay
        act(() => vi.advanceTimersByTime(500));

        // Should be final value
        expect(result.current).toBe('d');
    });
});

describe('useDebouncedCallback', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('should debounce callback execution', () => {
        const callback = vi.fn();
        const { result } = renderHook(() => useDebouncedCallback(callback, 300));

        // Call multiple times
        act(() => {
            result.current('a');
            result.current('b');
            result.current('c');
        });

        // Callback should not be called yet
        expect(callback).not.toHaveBeenCalled();

        // Fast-forward
        act(() => vi.advanceTimersByTime(300));

        // Should be called once with last argument
        expect(callback).toHaveBeenCalledTimes(1);
        expect(callback).toHaveBeenCalledWith('c');
    });
});

describe('useThrottledCallback', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('should throttle callback execution', () => {
        const callback = vi.fn();
        const { result } = renderHook(() => useThrottledCallback(callback, 200));

        // First call - should execute immediately
        act(() => {
            result.current('first');
        });
        expect(callback).toHaveBeenCalledWith('first');
        expect(callback).toHaveBeenCalledTimes(1);

        // Calls within throttle window
        act(() => {
            result.current('second');
            result.current('third');
        });

        // Should still be 1 call
        expect(callback).toHaveBeenCalledTimes(1);

        // After throttle window
        act(() => vi.advanceTimersByTime(200));

        // Should execute the last queued call
        expect(callback).toHaveBeenCalledTimes(2);
    });
});

describe('useDebouncedSearch', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('should handle search with typing state', () => {
        const { result } = renderHook(() => useDebouncedSearch(300));

        // Initial state
        expect(result.current.searchTerm).toBe('');
        expect(result.current.debouncedSearchTerm).toBe('');
        expect(result.current.isTyping).toBe(false);

        // Start typing
        act(() => {
            result.current.handleSearch('test');
        });

        expect(result.current.searchTerm).toBe('test');
        expect(result.current.isTyping).toBe(true);
        expect(result.current.debouncedSearchTerm).toBe(''); // Not yet

        // After delay
        act(() => vi.advanceTimersByTime(300));

        expect(result.current.debouncedSearchTerm).toBe('test');
        expect(result.current.isTyping).toBe(false);
    });

    it('should clear search', () => {
        const { result } = renderHook(() => useDebouncedSearch(300));

        act(() => {
            result.current.handleSearch('test');
            vi.advanceTimersByTime(300);
        });

        expect(result.current.searchTerm).toBe('test');

        act(() => {
            result.current.clearSearch();
        });

        expect(result.current.searchTerm).toBe('');
        expect(result.current.isTyping).toBe(false);
    });
});

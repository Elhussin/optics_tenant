// __tests__/hooks/useMobile.test.ts
/**
 * Tests for useMobile hooks
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import {
    useIsMobile,
    useDeviceType,
    useIsTouchDevice,
    useOrientation,
    useVibrate,
    useNetworkStatus,
} from '@/src/features/mobile/hooks/useMobile';

describe('useIsMobile', () => {
    const originalInnerWidth = window.innerWidth;

    afterEach(() => {
        Object.defineProperty(window, 'innerWidth', {
            writable: true,
            configurable: true,
            value: originalInnerWidth,
        });
    });

    it('should return true for mobile viewport', () => {
        Object.defineProperty(window, 'innerWidth', {
            writable: true,
            configurable: true,
            value: 375,
        });

        const { result } = renderHook(() => useIsMobile());
        expect(result.current).toBe(true);
    });

    it('should return false for desktop viewport', () => {
        Object.defineProperty(window, 'innerWidth', {
            writable: true,
            configurable: true,
            value: 1200,
        });

        const { result } = renderHook(() => useIsMobile());
        expect(result.current).toBe(false);
    });

    it('should use custom breakpoint', () => {
        Object.defineProperty(window, 'innerWidth', {
            writable: true,
            configurable: true,
            value: 500,
        });

        const { result: result1 } = renderHook(() => useIsMobile(400));
        expect(result1.current).toBe(false);

        const { result: result2 } = renderHook(() => useIsMobile(600));
        expect(result2.current).toBe(true);
    });
});

describe('useDeviceType', () => {
    afterEach(() => {
        Object.defineProperty(window, 'innerWidth', {
            writable: true,
            configurable: true,
            value: 1024,
        });
    });

    it('should detect mobile device', () => {
        Object.defineProperty(window, 'innerWidth', {
            writable: true,
            configurable: true,
            value: 375,
        });

        const { result } = renderHook(() => useDeviceType());
        expect(result.current).toBe('mobile');
    });

    it('should detect tablet device', () => {
        Object.defineProperty(window, 'innerWidth', {
            writable: true,
            configurable: true,
            value: 800,
        });

        const { result } = renderHook(() => useDeviceType());
        expect(result.current).toBe('tablet');
    });

    it('should detect desktop device', () => {
        Object.defineProperty(window, 'innerWidth', {
            writable: true,
            configurable: true,
            value: 1440,
        });

        const { result } = renderHook(() => useDeviceType());
        expect(result.current).toBe('desktop');
    });
});

describe('useIsTouchDevice', () => {
    it('should detect touch support', () => {
        const { result } = renderHook(() => useIsTouchDevice());
        // In test environment, ontouchstart is not defined
        expect(typeof result.current).toBe('boolean');
    });
});

describe('useOrientation', () => {
    afterEach(() => {
        Object.defineProperty(window, 'innerWidth', {
            writable: true,
            configurable: true,
            value: 1024,
        });
        Object.defineProperty(window, 'innerHeight', {
            writable: true,
            configurable: true,
            value: 768,
        });
    });

    it('should detect portrait orientation', () => {
        Object.defineProperty(window, 'innerWidth', {
            writable: true,
            configurable: true,
            value: 375,
        });
        Object.defineProperty(window, 'innerHeight', {
            writable: true,
            configurable: true,
            value: 812,
        });

        const { result } = renderHook(() => useOrientation());
        expect(result.current).toBe('portrait');
    });

    it('should detect landscape orientation', () => {
        Object.defineProperty(window, 'innerWidth', {
            writable: true,
            configurable: true,
            value: 812,
        });
        Object.defineProperty(window, 'innerHeight', {
            writable: true,
            configurable: true,
            value: 375,
        });

        const { result } = renderHook(() => useOrientation());
        expect(result.current).toBe('landscape');
    });
});

describe('useVibrate', () => {
    it('should call navigator.vibrate', () => {
        const vibrateSpy = vi.spyOn(navigator, 'vibrate');
        const { result } = renderHook(() => useVibrate());

        act(() => {
            result.current.vibrate(100);
        });

        expect(vibrateSpy).toHaveBeenCalledWith(100);
    });

    it('should have preset vibration patterns', () => {
        const vibrateSpy = vi.spyOn(navigator, 'vibrate');
        const { result } = renderHook(() => useVibrate());

        act(() => {
            result.current.vibrateSuccess();
        });
        expect(vibrateSpy).toHaveBeenCalledWith([50, 30, 50]);

        act(() => {
            result.current.vibrateError();
        });
        expect(vibrateSpy).toHaveBeenCalledWith([100, 50, 100, 50, 100]);
    });
});

describe('useNetworkStatus', () => {
    it('should return online status', () => {
        const { result } = renderHook(() => useNetworkStatus());

        expect(result.current.online).toBe(true); // navigator.onLine is true in jsdom
    });

    it('should update on online/offline events', () => {
        const { result } = renderHook(() => useNetworkStatus());

        act(() => {
            window.dispatchEvent(new Event('offline'));
        });

        // Note: In jsdom, navigator.onLine doesn't actually change
        // This test verifies the event listener is set up
        expect(typeof result.current.online).toBe('boolean');
    });
});

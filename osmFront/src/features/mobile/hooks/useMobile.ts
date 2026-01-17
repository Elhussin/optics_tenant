// features/mobile/hooks/useMobile.ts
/**
 * Mobile Detection & Utilities
 * خطافات الموبايل والأدوات المساعدة
 */

'use client';

import { useState, useEffect, useCallback } from 'react';

/**
 * Detect if device is mobile
 */
export function useIsMobile(breakpoint: number = 768): boolean {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < breakpoint);
        };

        // Initial check
        checkMobile();

        // Listen for resize
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, [breakpoint]);

    return isMobile;
}

/**
 * Detect device type
 */
type DeviceType = 'mobile' | 'tablet' | 'desktop';

export function useDeviceType(): DeviceType {
    const [deviceType, setDeviceType] = useState<DeviceType>('desktop');

    useEffect(() => {
        const checkDevice = () => {
            const width = window.innerWidth;
            if (width < 640) {
                setDeviceType('mobile');
            } else if (width < 1024) {
                setDeviceType('tablet');
            } else {
                setDeviceType('desktop');
            }
        };

        checkDevice();
        window.addEventListener('resize', checkDevice);
        return () => window.removeEventListener('resize', checkDevice);
    }, []);

    return deviceType;
}

/**
 * Touch detection
 */
export function useIsTouchDevice(): boolean {
    const [isTouch, setIsTouch] = useState(false);

    useEffect(() => {
        setIsTouch(
            'ontouchstart' in window ||
            navigator.maxTouchPoints > 0
        );
    }, []);

    return isTouch;
}

/**
 * Screen orientation
 */
type Orientation = 'portrait' | 'landscape';

export function useOrientation(): Orientation {
    const [orientation, setOrientation] = useState<Orientation>('portrait');

    useEffect(() => {
        const checkOrientation = () => {
            setOrientation(
                window.innerHeight > window.innerWidth ? 'portrait' : 'landscape'
            );
        };

        checkOrientation();
        window.addEventListener('resize', checkOrientation);
        window.addEventListener('orientationchange', checkOrientation);

        return () => {
            window.removeEventListener('resize', checkOrientation);
            window.removeEventListener('orientationchange', checkOrientation);
        };
    }, []);

    return orientation;
}

/**
 * Safe area insets (for notched devices)
 */
interface SafeAreaInsets {
    top: number;
    right: number;
    bottom: number;
    left: number;
}

export function useSafeArea(): SafeAreaInsets {
    const [insets, setInsets] = useState<SafeAreaInsets>({
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
    });

    useEffect(() => {
        const computeInsets = () => {
            const style = getComputedStyle(document.documentElement);
            setInsets({
                top: parseInt(style.getPropertyValue('--sat') || '0', 10),
                right: parseInt(style.getPropertyValue('--sar') || '0', 10),
                bottom: parseInt(style.getPropertyValue('--sab') || '0', 10),
                left: parseInt(style.getPropertyValue('--sal') || '0', 10),
            });
        };

        // Set CSS variables for safe area
        document.documentElement.style.setProperty(
            '--sat',
            'env(safe-area-inset-top)'
        );
        document.documentElement.style.setProperty(
            '--sar',
            'env(safe-area-inset-right)'
        );
        document.documentElement.style.setProperty(
            '--sab',
            'env(safe-area-inset-bottom)'
        );
        document.documentElement.style.setProperty(
            '--sal',
            'env(safe-area-inset-left)'
        );

        computeInsets();
    }, []);

    return insets;
}

/**
 * Vibration API
 */
export function useVibrate() {
    const vibrate = useCallback((pattern: number | number[] = 50) => {
        if ('vibrate' in navigator) {
            navigator.vibrate(pattern);
        }
    }, []);

    const vibrateSuccess = useCallback(() => vibrate([50, 30, 50]), [vibrate]);
    const vibrateError = useCallback(() => vibrate([100, 50, 100, 50, 100]), [vibrate]);
    const vibrateWarning = useCallback(() => vibrate([100, 100, 100]), [vibrate]);

    return { vibrate, vibrateSuccess, vibrateError, vibrateWarning };
}

/**
 * Network status
 */
interface NetworkStatus {
    online: boolean;
    effectiveType?: 'slow-2g' | '2g' | '3g' | '4g';
    downlink?: number;
    rtt?: number;
}

export function useNetworkStatus(): NetworkStatus {
    const [status, setStatus] = useState<NetworkStatus>({
        online: true,
    });

    useEffect(() => {
        const updateStatus = () => {
            const connection = (navigator as unknown as {
                connection?: {
                    effectiveType?: 'slow-2g' | '2g' | '3g' | '4g';
                    downlink?: number;
                    rtt?: number;
                }
            }).connection;

            setStatus({
                online: navigator.onLine,
                effectiveType: connection?.effectiveType,
                downlink: connection?.downlink,
                rtt: connection?.rtt,
            });
        };

        updateStatus();

        window.addEventListener('online', updateStatus);
        window.addEventListener('offline', updateStatus);

        return () => {
            window.removeEventListener('online', updateStatus);
            window.removeEventListener('offline', updateStatus);
        };
    }, []);

    return status;
}

/**
 * Prevent Pull to Refresh (for custom implementation)
 */
export function usePreventPullToRefresh(enabled: boolean = true) {
    useEffect(() => {
        if (!enabled) return;

        const preventPull = (e: TouchEvent) => {
            if (window.scrollY === 0 && e.touches[0].clientY > 0) {
                e.preventDefault();
            }
        };

        document.addEventListener('touchmove', preventPull, { passive: false });
        return () => document.removeEventListener('touchmove', preventPull);
    }, [enabled]);
}

export default useIsMobile;

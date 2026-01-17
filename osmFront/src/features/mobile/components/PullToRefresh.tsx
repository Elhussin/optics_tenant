// features/mobile/components/PullToRefresh.tsx
/**
 * Pull to Refresh Component
 * مكون السحب للتحديث
 */

"use client";

import React, { useState, useRef, useCallback } from "react";
import { RefreshCw } from "lucide-react";
import { cn } from "@/src/shared/utils/cn";

interface PullToRefreshProps {
  children: React.ReactNode;
  onRefresh: () => Promise<void>;
  threshold?: number;
  className?: string;
  disabled?: boolean;
}

export function PullToRefresh({
  children,
  onRefresh,
  threshold = 80,
  className,
  disabled = false,
}: PullToRefreshProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [startY, setStartY] = useState(0);
  const [pullDistance, setPullDistance] = useState(0);
  const [isPulling, setIsPulling] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [canPull, setCanPull] = useState(false);

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (disabled || isRefreshing) return;

      // Only allow pull when scrolled to top
      if (containerRef.current && containerRef.current.scrollTop === 0) {
        setStartY(e.touches[0].clientY);
        setCanPull(true);
      }
    },
    [disabled, isRefreshing]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!canPull || disabled || isRefreshing) return;

      const currentY = e.touches[0].clientY;
      const diff = currentY - startY;

      if (diff > 0) {
        setIsPulling(true);
        // Apply resistance for a more natural feel
        const resistance = 0.5;
        const distance = Math.min(diff * resistance, threshold * 1.5);
        setPullDistance(distance);
      }
    },
    [canPull, disabled, isRefreshing, startY, threshold]
  );

  const handleTouchEnd = useCallback(async () => {
    if (!isPulling) return;

    setCanPull(false);

    if (pullDistance >= threshold && !isRefreshing) {
      setIsRefreshing(true);
      setPullDistance(threshold);

      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
        setPullDistance(0);
        setIsPulling(false);
      }
    } else {
      setPullDistance(0);
      setIsPulling(false);
    }
  }, [isPulling, pullDistance, threshold, isRefreshing, onRefresh]);

  // Calculate indicator state
  const progress = Math.min(pullDistance / threshold, 1);
  const rotation = progress * 360;
  const shouldTrigger = progress >= 1;

  return (
    <div
      ref={containerRef}
      className={cn("relative overflow-auto", className)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull indicator */}
      <div
        className={cn(
          "absolute left-1/2 -translate-x-1/2 z-10",
          "flex items-center justify-center",
          "w-10 h-10 rounded-full",
          "bg-surface shadow-lg border border-border-main",
          "transition-all duration-200",
          pullDistance > 0 ? "opacity-100" : "opacity-0"
        )}
        style={{
          top: pullDistance - 50,
          transform: `translateX(-50%) rotate(${rotation}deg)`,
        }}
      >
        <RefreshCw
          className={cn(
            "w-5 h-5",
            shouldTrigger || isRefreshing ? "text-primary" : "text-secondary",
            isRefreshing && "animate-spin"
          )}
        />
      </div>

      {/* Content wrapper */}
      <div
        className={cn(
          "transition-transform duration-200",
          !isPulling && "duration-300"
        )}
        style={{
          transform: `translateY(${pullDistance}px)`,
        }}
      >
        {children}
      </div>
    </div>
  );
}

// Loading indicator for refresh
interface RefreshIndicatorProps {
  refreshing: boolean;
  progress?: number;
  className?: string;
}

export function RefreshIndicator({
  refreshing,
  progress = 0,
  className,
}: RefreshIndicatorProps) {
  if (!refreshing && progress <= 0) return null;

  return (
    <div
      className={cn(
        "absolute top-0 left-0 right-0",
        "flex items-center justify-center py-3",
        "bg-surface/80 backdrop-blur-sm",
        className
      )}
    >
      <div className="flex items-center gap-2">
        <RefreshCw
          className={cn("w-4 h-4 text-primary", refreshing && "animate-spin")}
        />
        <span className="text-sm text-secondary">
          {refreshing ? "جاري التحديث..." : "اسحب للتحديث"}
        </span>
      </div>
    </div>
  );
}

export default PullToRefresh;

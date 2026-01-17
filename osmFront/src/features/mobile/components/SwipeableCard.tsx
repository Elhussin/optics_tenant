// features/mobile/components/SwipeableCard.tsx
/**
 * Swipeable Card Component
 * بطاقة قابلة للسحب
 */

"use client";

import React, { useRef, useState } from "react";
import { cn } from "@/src/shared/utils/cn";

interface SwipeAction {
  icon: React.ReactNode;
  label: string;
  color: "primary" | "danger" | "success" | "warning";
  onClick: () => void;
}

interface SwipeableCardProps {
  children: React.ReactNode;
  leftActions?: SwipeAction[];
  rightActions?: SwipeAction[];
  className?: string;
  disabled?: boolean;
  threshold?: number; // Minimum swipe distance to trigger action
}

const colorClasses = {
  primary: "bg-primary",
  danger: "bg-danger",
  success: "bg-success",
  warning: "bg-highlight",
};

export function SwipeableCard({
  children,
  leftActions = [],
  rightActions = [],
  className,
  disabled = false,
  threshold = 80,
}: SwipeableCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [startX, setStartX] = useState(0);
  const [currentX, setCurrentX] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);

  const maxSwipeLeft = leftActions.length * 80;
  const maxSwipeRight = rightActions.length * 80;

  const handleTouchStart = (e: React.TouchEvent) => {
    if (disabled) return;
    setStartX(e.touches[0].clientX);
    setIsSwiping(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isSwiping || disabled) return;

    const diff = e.touches[0].clientX - startX;

    // Limit swipe distance
    let limitedDiff = diff;
    if (diff > 0) {
      // Swiping right (reveal left actions)
      limitedDiff = Math.min(diff, maxSwipeLeft);
    } else {
      // Swiping left (reveal right actions)
      limitedDiff = Math.max(diff, -maxSwipeRight);
    }

    setCurrentX(limitedDiff);
  };

  const handleTouchEnd = () => {
    if (!isSwiping) return;
    setIsSwiping(false);

    // Snap to action or reset
    if (Math.abs(currentX) > threshold) {
      if (currentX > 0 && leftActions.length > 0) {
        // Trigger first left action
        leftActions[0].onClick();
      } else if (currentX < 0 && rightActions.length > 0) {
        // Trigger first right action
        rightActions[0].onClick();
      }
    }

    // Reset position
    setCurrentX(0);
  };

  const renderActions = (actions: SwipeAction[], side: "left" | "right") => {
    if (actions.length === 0) return null;

    return (
      <div
        className={cn(
          "absolute top-0 bottom-0 flex",
          side === "left" ? "left-0" : "right-0"
        )}
      >
        {actions.map((action, index) => (
          <button
            key={index}
            onClick={action.onClick}
            className={cn(
              "w-20 flex flex-col items-center justify-center text-white",
              colorClasses[action.color]
            )}
          >
            <span className="w-6 h-6">{action.icon}</span>
            <span className="text-xs mt-1">{action.label}</span>
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {/* Left actions (revealed on swipe right) */}
      {renderActions(leftActions, "left")}

      {/* Right actions (revealed on swipe left) */}
      {renderActions(rightActions, "right")}

      {/* Main content */}
      <div
        ref={cardRef}
        className={cn(
          "relative bg-surface transition-transform",
          !isSwiping && "duration-200"
        )}
        style={{
          transform: `translateX(${currentX}px)`,
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {children}
      </div>
    </div>
  );
}

// Alternative: Simple action card with swipe indicator
interface ActionCardProps {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  leftLabel?: string;
  rightLabel?: string;
  leftColor?: string;
  rightColor?: string;
  className?: string;
}

export function ActionCard({
  children,
  onSwipeLeft,
  onSwipeRight,
  leftLabel,
  rightLabel,
  leftColor = "bg-success",
  rightColor = "bg-danger",
  className,
}: ActionCardProps) {
  const [startX, setStartX] = useState(0);
  const [offsetX, setOffsetX] = useState(0);
  const [swiping, setSwiping] = useState(false);

  const threshold = 100;

  const handleStart = (clientX: number) => {
    setStartX(clientX);
    setSwiping(true);
  };

  const handleMove = (clientX: number) => {
    if (!swiping) return;
    const diff = clientX - startX;
    // Apply resistance at edges
    const resistance = 0.5;
    setOffsetX(diff * resistance);
  };

  const handleEnd = () => {
    if (!swiping) return;
    setSwiping(false);

    if (offsetX > threshold && onSwipeRight) {
      onSwipeRight();
    } else if (offsetX < -threshold && onSwipeLeft) {
      onSwipeLeft();
    }

    setOffsetX(0);
  };

  const showLeftIndicator = offsetX > 50 && onSwipeRight;
  const showRightIndicator = offsetX < -50 && onSwipeLeft;

  return (
    <div className={cn("relative overflow-hidden rounded-xl", className)}>
      {/* Left indicator */}
      {showLeftIndicator && (
        <div
          className={cn(
            "absolute inset-y-0 left-0 flex items-center justify-center px-4",
            leftColor
          )}
          style={{ width: Math.abs(offsetX) }}
        >
          <span className="text-white text-sm font-medium">{leftLabel}</span>
        </div>
      )}

      {/* Right indicator */}
      {showRightIndicator && (
        <div
          className={cn(
            "absolute inset-y-0 right-0 flex items-center justify-center px-4",
            rightColor
          )}
          style={{ width: Math.abs(offsetX) }}
        >
          <span className="text-white text-sm font-medium">{rightLabel}</span>
        </div>
      )}

      {/* Content */}
      <div
        className={cn(
          "relative bg-surface",
          !swiping && "transition-transform duration-200"
        )}
        style={{ transform: `translateX(${offsetX}px)` }}
        onTouchStart={(e) => handleStart(e.touches[0].clientX)}
        onTouchMove={(e) => handleMove(e.touches[0].clientX)}
        onTouchEnd={handleEnd}
        onMouseDown={(e) => handleStart(e.clientX)}
        onMouseMove={(e) => swiping && handleMove(e.clientX)}
        onMouseUp={handleEnd}
        onMouseLeave={handleEnd}
      >
        {children}
      </div>
    </div>
  );
}

export default SwipeableCard;

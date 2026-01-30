// shared/components/ui/Badge.tsx
/**
 * Badge Component
 * مكون الشارة
 */

"use client";

import React from "react";
import { cn } from "@/src/shared/utils/cn";

type BadgeVariant =
  | "primary"
  | "secondary"
  | "success"
  | "danger"
  | "warning"
  | "info"
  | "neutral";
type BadgeSize = "sm" | "md" | "lg";

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  icon?: React.ReactNode;
  dot?: boolean;
  outline?: boolean;
  className?: string;
}

const variantStyles: Record<BadgeVariant, { solid: string; outline: string }> =
  {
    primary: {
      solid: "bg-primary text-white",
      outline: "border-primary text-primary bg-primary/10",
    },
    secondary: {
      solid: "bg-secondary text-white",
      outline: "border-secondary text-secondary bg-secondary/10",
    },
    success: {
      solid: "bg-success text-white",
      outline: "border-success text-success bg-success/10",
    },
    danger: {
      solid: "bg-danger text-white",
      outline: "border-danger text-danger bg-danger/10",
    },
    warning: {
      solid: "bg-highlight text-white",
      outline: "border-highlight text-highlight bg-highlight/10",
    },
    info: {
      solid: "bg-info text-white",
      outline: "border-info text-info bg-info/10",
    },
    neutral: {
      solid: "bg-elevated text-main",
      outline: "border-primary/20 text-secondary bg-transparent",
    },
  };

const sizeStyles: Record<BadgeSize, string> = {
  sm: "text-xs px-2 py-0.5",
  md: "text-sm px-2.5 py-1",
  lg: "text-base px-3 py-1.5",
};

export function Badge({
  children,
  variant = "primary",
  size = "md",
  icon,
  dot = false,
  outline = false,
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-medium transition-colors",
        outline
          ? `border ${variantStyles[variant].outline}`
          : variantStyles[variant].solid,
        sizeStyles[size],
        className
      )}
    >
      {dot && (
        <span
          className={cn(
            "w-1.5 h-1.5 rounded-full",
            outline ? "bg-current" : "bg-white"
          )}
        />
      )}
      {icon && <span className="w-3.5 h-3.5">{icon}</span>}
      {children}
    </span>
  );
}

// Count Badge (for notifications)
interface CountBadgeProps {
  count: number;
  max?: number;
  size?: "sm" | "md" | "lg";
  color?: "primary" | "danger" | "warning";
  className?: string;
}

export function CountBadge({
  count,
  max = 99,
  size = "md",
  color = "danger",
  className,
}: CountBadgeProps) {
  const displayCount = count > max ? `${max}+` : count;

  if (count <= 0) return null;

  const sizeStyles = {
    sm: "min-w-4 h-4 text-[10px]",
    md: "min-w-5 h-5 text-xs",
    lg: "min-w-6 h-6 text-sm",
  };

  const colorStyles = {
    primary: "bg-primary",
    danger: "bg-danger",
    warning: "bg-highlight",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-full font-bold text-white px-1",
        sizeStyles[size],
        colorStyles[color],
        className
      )}
    >
      {displayCount}
    </span>
  );
}

// Status Badge with pulse animation
interface StatusBadgeProps {
  status: "online" | "offline" | "busy" | "away";
  label?: string;
  size?: "sm" | "md";
}

export function StatusBadge({ status, label, size = "md" }: StatusBadgeProps) {
  const statusConfig = {
    online: { color: "bg-green-500", label: "متصل" },
    offline: { color: "bg-gray-400", label: "غير متصل" },
    busy: { color: "bg-red-500", label: "مشغول" },
    away: { color: "bg-yellow-500", label: "بعيد" },
  };

  const config = statusConfig[status];
  const dotSize = size === "sm" ? "w-2 h-2" : "w-2.5 h-2.5";

  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="relative flex">
        <span
          className={cn(
            dotSize,
            "rounded-full",
            config.color,
            status === "online" && "animate-pulse"
          )}
        />
      </span>
      {label !== undefined ? label : size === "md" && config.label}
    </span>
  );
}

export default Badge;

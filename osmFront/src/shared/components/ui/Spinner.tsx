// shared/components/ui/Spinner.tsx
/**
 * Loading Spinner Component
 * مكون مؤشر التحميل
 */

"use client";

import React from "react";
import { cn } from "@/src/shared/utils/cn";
import { Loader2 } from "lucide-react";

type SpinnerSize = "xs" | "sm" | "md" | "lg" | "xl";
type SpinnerVariant = "default" | "primary" | "white" | "success" | "danger";

interface SpinnerProps {
  size?: SpinnerSize;
  variant?: SpinnerVariant;
  className?: string;
}

const sizeStyles: Record<SpinnerSize, string> = {
  xs: "w-3 h-3",
  sm: "w-4 h-4",
  md: "w-6 h-6",
  lg: "w-8 h-8",
  xl: "w-12 h-12",
};

const variantStyles: Record<SpinnerVariant, string> = {
  default: "text-secondary",
  primary: "text-primary",
  white: "text-white",
  success: "text-success",
  danger: "text-danger",
};

export function Spinner({
  size = "md",
  variant = "primary",
  className,
}: SpinnerProps) {
  return (
    <Loader2
      className={cn(
        "animate-spin",
        sizeStyles[size],
        variantStyles[variant],
        className
      )}
    />
  );
}

// Full Page Loading
interface PageLoadingProps {
  message?: string;
}

export function PageLoading({ message = "جاري التحميل..." }: PageLoadingProps) {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-body z-50">
      <Spinner size="xl" />
      <p className="mt-4 text-secondary animate-pulse">{message}</p>
    </div>
  );
}

// Inline Loading
interface InlineLoadingProps {
  message?: string;
  size?: SpinnerSize;
  className?: string;
}

export function InlineLoading({
  message,
  size = "sm",
  className,
}: InlineLoadingProps) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <Spinner size={size} />
      {message && <span className="text-secondary">{message}</span>}
    </span>
  );
}

// Section Loading Overlay
interface LoadingOverlayProps {
  show?: boolean;
  message?: string;
  blur?: boolean;
  className?: string;
}

export function LoadingOverlay({
  show = true,
  message,
  blur = true,
  className,
}: LoadingOverlayProps) {
  if (!show) return null;

  return (
    <div
      className={cn(
        "absolute inset-0 flex flex-col items-center justify-center bg-surface/80 z-50 rounded-inherit",
        blur && "backdrop-blur-sm",
        className
      )}
    >
      <Spinner size="lg" />
      {message && <p className="mt-3 text-sm text-secondary">{message}</p>}
    </div>
  );
}

// Button Loading (for use inside buttons)
interface ButtonSpinnerProps {
  loading?: boolean;
  children: React.ReactNode;
  loadingText?: string;
}

export function ButtonSpinner({
  loading = false,
  children,
  loadingText,
}: ButtonSpinnerProps) {
  if (!loading) return <>{children}</>;

  return (
    <span className="inline-flex items-center gap-2">
      <Spinner size="xs" variant="white" />
      {loadingText || children}
    </span>
  );
}

export default Spinner;

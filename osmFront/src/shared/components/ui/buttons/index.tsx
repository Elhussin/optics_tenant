"use client";

import React, { useState } from "react";
import { cn } from "@/src/shared/utils/cn";
import { ButtonProps as BaseButtonProps } from "@/src/shared/types";
import { useRouter } from "@/src/app/i18n/navigation";
import { ButtonSpinner } from "../Spinner";
import { useVibrate } from "@/src/features/mobile/hooks/useMobile";

// Extend props to include loading and size
interface ActionButtonProps extends BaseButtonProps {
  isLoading?: boolean;
  size?: "xs" | "sm" | "md" | "lg";
  fullWidth?: boolean;
  animate?: boolean;
  haptic?: boolean;
}

const variantClasses = {
  primary: "btn-primary shadow-primary/20",
  secondary: "btn-secondary shadow-secondary/20",
  danger: "btn-danger shadow-danger/20",
  success: "btn-success shadow-success/20",
  info: "btn-info shadow-info/20",
  warning: "btn-warning shadow-warning/20",
  outline: "btn-outline",
  ghost: "btn-ghost",
  link: "btn-link p-0 h-auto",
  custom: "",
  glass: "glass hover:bg-white/20 text-main border-white/20",

  // Icon Button Variants - Consistent UX across the app
  "icon-view":
    "bg-primary/5 text-primary hover:bg-primary hover:text-white shadow-none border border-primary/10 hover:border-primary transition-all duration-300",
  "icon-edit":
    "bg-warning/5 text-warning hover:bg-warning hover:text-white shadow-none border border-warning/10 hover:border-warning transition-all duration-300",
  "icon-delete":
    "bg-danger/5 text-danger hover:bg-danger hover:text-white shadow-none border border-danger/10 hover:border-danger transition-all duration-300",
  "icon-info":
    "bg-info/5 text-info hover:bg-info hover:text-white shadow-none border border-info/10 hover:border-info transition-all duration-300",
  "icon-success":
    "bg-success/5 text-success hover:bg-success hover:text-white shadow-none border border-success/10 hover:border-success transition-all duration-300",
};

const sizeClasses = {
  xs: "h-8 px-2 text-xs gap-1",
  sm: "h-9 px-3 text-sm gap-1.5",
  md: "h-11 px-5 text-base gap-2",
  lg: "h-14 px-8 text-lg gap-3",
};

export function ActionButton({
  label = "",
  icon,
  variant = "primary",
  size = "md",
  className = "",
  type = "button",
  title = "",
  disabled,
  isLoading: externalLoading,
  onClick,
  onCrud,
  navigateTo,
  name,
  fullWidth = false,
  animate = true,
  haptic = true,
}: ActionButtonProps) {
  const router = useRouter();
  const { vibrate } = useVibrate();
  const [internalLoading, setInternalLoading] = useState(false);

  const isLoading = externalLoading || internalLoading;

  const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled || isLoading) return;

    // Mobile haptics
    if (haptic) vibrate(10);

    try {
      setInternalLoading(true);

      // Execute onClick if exists
      if (onClick) await onClick(e);

      // Execute onCrud if exists
      if (onCrud) await onCrud(e);

      // Handle navigation
      if (navigateTo) {
        router.push(navigateTo);
      }
    } catch (error) {
      console.error("ActionButton Error:", error);
    } finally {
      setInternalLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      type={type}
      name={name}
      title={title}
      disabled={disabled || isLoading}
      className={cn(
        "relative inline-flex items-center justify-center font-semibold transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden cursor-pointer",
        variantClasses[variant as keyof typeof variantClasses] ||
          variantClasses.primary,
        sizeClasses[size],
        fullWidth ? "w-full" : "w-auto",
        animate && "hover-lift hover:shadow-lg",
        className
      )}
    >
      <ButtonSpinner loading={isLoading}>
        {icon && (
          <span
            className={cn("inline-flex shrink-0", isLoading && "opacity-0")}
          >
            {icon}
          </span>
        )}
        {label && <span className={cn(isLoading && "opacity-0")}>{label}</span>}
      </ButtonSpinner>

      {/* Subtle overlay for active state */}
      <span className="absolute inset-0 bg-black/0 active:bg-black/5 transition-colors" />
    </button>
  );
}

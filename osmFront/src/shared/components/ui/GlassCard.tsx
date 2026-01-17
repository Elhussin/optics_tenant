// shared/components/ui/GlassCard.tsx
/**
 * Glass Card Component
 * مكون البطاقة الزجاجية
 */

"use client";

import React from "react";
import { cn } from "@/src/shared/utils/cn";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "dark" | "primary" | "success" | "danger" | "warning";
  blur?: "sm" | "md" | "lg";
  hover?: boolean;
  animate?: "none" | "fade-in" | "scale-in" | "slide-up";
  padding?: "none" | "sm" | "md" | "lg";
  onClick?: () => void;
}

const variantStyles = {
  default:
    "bg-white/70 dark:bg-slate-800/70 border-white/30 dark:border-white/10",
  dark: "bg-slate-900/70 border-white/10 text-white",
  primary: "bg-primary/10 border-primary/20",
  success: "bg-green-500/10 border-green-500/20",
  danger: "bg-red-500/10 border-red-500/20",
  warning: "bg-yellow-500/10 border-yellow-500/20",
};

const blurStyles = {
  sm: "backdrop-blur-sm",
  md: "backdrop-blur-md",
  lg: "backdrop-blur-lg",
};

const animateStyles = {
  none: "",
  "fade-in": "animate-fade-in",
  "scale-in": "animate-scale-in",
  "slide-up": "animate-fade-in-up",
};

const paddingStyles = {
  none: "",
  sm: "p-3",
  md: "p-4 md:p-6",
  lg: "p-6 md:p-8",
};

export function GlassCard({
  children,
  className,
  variant = "default",
  blur = "md",
  hover = false,
  animate = "none",
  padding = "md",
  onClick,
}: GlassCardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border",
        variantStyles[variant],
        blurStyles[blur],
        paddingStyles[padding],
        animateStyles[animate],
        hover &&
          "transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer",
        onClick && "cursor-pointer",
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

// Glass Card Header
interface GlassCardHeaderProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export function GlassCardHeader({
  title,
  subtitle,
  icon,
  action,
  className,
}: GlassCardHeaderProps) {
  return (
    <div className={cn("flex items-start justify-between mb-4", className)}>
      <div className="flex items-center gap-3">
        {icon && (
          <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
            {icon}
          </div>
        )}
        <div>
          <h3 className="font-semibold text-lg">{title}</h3>
          {subtitle && <p className="text-sm text-secondary">{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
  );
}

// Glass Card Footer
interface GlassCardFooterProps {
  children: React.ReactNode;
  className?: string;
  align?: "start" | "center" | "end" | "between";
}

export function GlassCardFooter({
  children,
  className,
  align = "end",
}: GlassCardFooterProps) {
  const alignStyles = {
    start: "justify-start",
    center: "justify-center",
    end: "justify-end",
    between: "justify-between",
  };

  return (
    <div
      className={cn(
        "flex items-center gap-2 mt-4 pt-4 border-t border-white/10",
        alignStyles[align],
        className
      )}
    >
      {children}
    </div>
  );
}

export default GlassCard;

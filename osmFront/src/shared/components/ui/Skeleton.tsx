// shared/components/ui/Skeleton.tsx
/**
 * Skeleton Loading Component
 * مكون التحميل الهيكلي
 */

"use client";

import React from "react";
import { cn } from "@/src/shared/utils/cn";

interface SkeletonProps {
  className?: string;
  variant?:
    | "text"
    | "title"
    | "avatar"
    | "button"
    | "card"
    | "image"
    | "custom";
  width?: string | number;
  height?: string | number;
  rounded?: "none" | "sm" | "md" | "lg" | "full";
  animate?: boolean;
}

const variantClasses = {
  text: "h-4 w-full",
  title: "h-6 w-3/4",
  avatar: "h-10 w-10 rounded-full",
  button: "h-10 w-24",
  card: "h-40 w-full",
  image: "h-48 w-full",
  custom: "",
};

const roundedClasses = {
  none: "rounded-none",
  sm: "rounded-sm",
  md: "rounded-md",
  lg: "rounded-lg",
  full: "rounded-full",
};

export function Skeleton({
  className,
  variant = "text",
  width,
  height,
  rounded = "md",
  animate = true,
}: SkeletonProps) {
  return (
    <div
      className={cn(
        "bg-elevated relative overflow-hidden",
        variantClasses[variant],
        variant !== "avatar" && roundedClasses[rounded],
        animate && "animate-shimmer",
        className
      )}
      style={{
        width: width
          ? typeof width === "number"
            ? `${width}px`
            : width
          : undefined,
        height: height
          ? typeof height === "number"
            ? `${height}px`
            : height
          : undefined,
      }}
    />
  );
}

// Skeleton Group for common patterns
interface SkeletonGroupProps {
  type: "list-item" | "card" | "table-row" | "profile";
  count?: number;
}

export function SkeletonGroup({ type, count = 1 }: SkeletonGroupProps) {
  const items = Array.from({ length: count });

  switch (type) {
    case "list-item":
      return (
        <>
          {items.map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-4">
              <Skeleton variant="avatar" />
              <div className="flex-1 space-y-2">
                <Skeleton variant="title" />
                <Skeleton variant="text" width="60%" />
              </div>
            </div>
          ))}
        </>
      );

    case "card":
      return (
        <>
          {items.map((_, i) => (
            <div
              key={i}
              className="p-4 border border-primary/20 rounded-xl space-y-4"
            >
              <Skeleton variant="image" height={120} />
              <Skeleton variant="title" />
              <Skeleton variant="text" />
              <Skeleton variant="text" width="70%" />
              <div className="flex gap-2">
                <Skeleton variant="button" />
                <Skeleton variant="button" />
              </div>
            </div>
          ))}
        </>
      );

    case "table-row":
      return (
        <>
          {items.map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-4 p-4 border-b border-primary/20"
            >
              <Skeleton width={40} height={16} />
              <Skeleton variant="text" className="flex-1" />
              <Skeleton variant="text" width={100} />
              <Skeleton variant="text" width={80} />
              <Skeleton variant="button" width={60} />
            </div>
          ))}
        </>
      );

    case "profile":
      return (
        <div className="flex flex-col items-center gap-4 p-6">
          <Skeleton variant="avatar" width={80} height={80} />
          <Skeleton variant="title" width={150} />
          <Skeleton variant="text" width={200} />
          <div className="flex gap-2">
            <Skeleton variant="button" />
            <Skeleton variant="button" />
          </div>
        </div>
      );

    default:
      return null;
  }
}

export default Skeleton;

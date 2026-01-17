// shared/components/ui/Avatar.tsx
/**
 * Avatar Component
 * مكون الصورة الشخصية
 */

"use client";

import React from "react";
import { cn } from "@/src/shared/utils/cn";
import Image from "next/image";

type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
type AvatarStatus = "online" | "offline" | "busy" | "away";

interface AvatarProps {
  src?: string | null;
  alt?: string;
  name?: string;
  size?: AvatarSize;
  status?: AvatarStatus;
  rounded?: "full" | "lg" | "md";
  border?: boolean;
  className?: string;
}

const sizeStyles: Record<
  AvatarSize,
  { container: string; text: string; status: string }
> = {
  xs: { container: "w-6 h-6", text: "text-[10px]", status: "w-2 h-2 border" },
  sm: { container: "w-8 h-8", text: "text-xs", status: "w-2.5 h-2.5 border" },
  md: { container: "w-10 h-10", text: "text-sm", status: "w-3 h-3 border-2" },
  lg: {
    container: "w-14 h-14",
    text: "text-lg",
    status: "w-3.5 h-3.5 border-2",
  },
  xl: { container: "w-20 h-20", text: "text-xl", status: "w-4 h-4 border-2" },
  "2xl": {
    container: "w-28 h-28",
    text: "text-2xl",
    status: "w-5 h-5 border-2",
  },
};

const statusColors: Record<AvatarStatus, string> = {
  online: "bg-green-500",
  offline: "bg-gray-400",
  busy: "bg-red-500",
  away: "bg-yellow-500",
};

const roundedStyles = {
  full: "rounded-full",
  lg: "rounded-xl",
  md: "rounded-lg",
};

// Generate initials from name
function getInitials(name: string): string {
  return name
    .split(" ")
    .map((word) => word.charAt(0))
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

// Generate color from name
function getColorFromName(name: string): string {
  const colors = [
    "bg-blue-500",
    "bg-green-500",
    "bg-purple-500",
    "bg-pink-500",
    "bg-indigo-500",
    "bg-cyan-500",
    "bg-orange-500",
    "bg-teal-500",
  ];
  const index = name
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[index % colors.length];
}

export function Avatar({
  src,
  alt,
  name,
  size = "md",
  status,
  rounded = "full",
  border = false,
  className,
}: AvatarProps) {
  const styles = sizeStyles[size];
  const initials = name ? getInitials(name) : "?";
  const bgColor = name ? getColorFromName(name) : "bg-primary";

  return (
    <div className={cn("relative inline-flex", className)}>
      <div
        className={cn(
          "flex items-center justify-center overflow-hidden",
          styles.container,
          roundedStyles[rounded],
          border && "ring-2 ring-surface ring-offset-2",
          !src && `${bgColor} text-white font-semibold ${styles.text}`
        )}
      >
        {src ? (
          <Image
            src={src}
            alt={alt || name || "Avatar"}
            fill
            className="object-cover"
          />
        ) : (
          <span>{initials}</span>
        )}
      </div>

      {status && (
        <span
          className={cn(
            "absolute bottom-0 right-0 border-surface",
            styles.status,
            "rounded-full",
            statusColors[status]
          )}
        />
      )}
    </div>
  );
}

// Avatar Group
interface AvatarGroupProps {
  avatars: Array<{
    src?: string | null;
    name?: string;
    alt?: string;
  }>;
  max?: number;
  size?: AvatarSize;
  className?: string;
}

export function AvatarGroup({
  avatars,
  max = 4,
  size = "md",
  className,
}: AvatarGroupProps) {
  const displayAvatars = avatars.slice(0, max);
  const remaining = avatars.length - max;

  const overlapStyles: Record<AvatarSize, string> = {
    xs: "-ml-2",
    sm: "-ml-2.5",
    md: "-ml-3",
    lg: "-ml-4",
    xl: "-ml-5",
    "2xl": "-ml-6",
  };

  return (
    <div className={cn("flex items-center", className)}>
      {displayAvatars.map((avatar, index) => (
        <div
          key={index}
          className={cn(index > 0 && overlapStyles[size])}
          style={{ zIndex: displayAvatars.length - index }}
        >
          <Avatar
            src={avatar.src}
            name={avatar.name}
            alt={avatar.alt}
            size={size}
            border
          />
        </div>
      ))}

      {remaining > 0 && (
        <div
          className={cn(
            overlapStyles[size],
            sizeStyles[size].container,
            "flex items-center justify-center rounded-full bg-elevated text-secondary font-medium ring-2 ring-surface",
            sizeStyles[size].text
          )}
          style={{ zIndex: 0 }}
        >
          +{remaining}
        </div>
      )}
    </div>
  );
}

export default Avatar;

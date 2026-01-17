// features/mobile/components/MobileHeader.tsx
/**
 * Mobile Header Component
 * رأس الصفحة للموبايل
 */

"use client";

import React, { useState } from "react";
import {
  Menu,
  X,
  Bell,
  Search,
  ArrowRight,
  ChevronLeft,
  Settings,
} from "lucide-react";
import { cn } from "@/src/shared/utils/cn";
import { useRouter } from "next/navigation";

interface MobileHeaderProps {
  title?: string;
  showBack?: boolean;
  showSearch?: boolean;
  showNotifications?: boolean;
  showMenu?: boolean;
  notificationCount?: number;
  onMenuClick?: () => void;
  onSearchClick?: () => void;
  onNotificationClick?: () => void;
  rightAction?: React.ReactNode;
  className?: string;
  transparent?: boolean;
}

export function MobileHeader({
  title,
  showBack = false,
  showSearch = false,
  showNotifications = false,
  showMenu = false,
  notificationCount = 0,
  onMenuClick,
  onSearchClick,
  onNotificationClick,
  rightAction,
  className,
  transparent = false,
}: MobileHeaderProps) {
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-40",
        "h-14 px-4",
        "flex items-center justify-between gap-3",
        "pt-[env(safe-area-inset-top)]",
        transparent
          ? "bg-transparent"
          : "bg-surface/95 backdrop-blur-md border-b border-border-main",
        "md:hidden",
        className
      )}
    >
      {/* Left side */}
      <div className="flex items-center gap-2">
        {showBack && (
          <button
            onClick={handleBack}
            className="p-2 -ml-2 rounded-lg hover:bg-elevated transition-colors"
            aria-label="رجوع"
          >
            <ArrowRight className="w-6 h-6" />
          </button>
        )}

        {showMenu && !showBack && (
          <button
            onClick={onMenuClick}
            className="p-2 -ml-2 rounded-lg hover:bg-elevated transition-colors"
            aria-label="القائمة"
          >
            <Menu className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* Title */}
      {title && (
        <h1 className="flex-1 text-lg font-semibold truncate text-center">
          {title}
        </h1>
      )}

      {/* Right side */}
      <div className="flex items-center gap-1">
        {showSearch && (
          <button
            onClick={onSearchClick}
            className="p-2 rounded-lg hover:bg-elevated transition-colors"
            aria-label="بحث"
          >
            <Search className="w-5 h-5" />
          </button>
        )}

        {showNotifications && (
          <button
            onClick={onNotificationClick}
            className="relative p-2 rounded-lg hover:bg-elevated transition-colors"
            aria-label="الإشعارات"
          >
            <Bell className="w-5 h-5" />
            {notificationCount > 0 && (
              <span className="absolute top-1 right-1 min-w-[16px] h-4 flex items-center justify-center text-[10px] font-bold bg-danger text-white rounded-full px-0.5">
                {notificationCount > 9 ? "9+" : notificationCount}
              </span>
            )}
          </button>
        )}

        {rightAction}
      </div>
    </header>
  );
}

// Page Header for mobile pages
interface MobilePageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export function MobilePageHeader({
  title,
  subtitle,
  icon,
  action,
  className,
}: MobilePageHeaderProps) {
  return (
    <div
      className={cn("flex items-center justify-between gap-4 mb-4", className)}
    >
      <div className="flex items-center gap-3">
        {icon && (
          <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
            {icon}
          </div>
        )}
        <div>
          <h2 className="text-lg font-bold">{title}</h2>
          {subtitle && <p className="text-sm text-secondary">{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
  );
}

// Mobile Drawer/Sidebar
interface MobileDrawerProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  position?: "left" | "right";
  title?: string;
}

export function MobileDrawer({
  open,
  onClose,
  children,
  position = "right",
  title,
}: MobileDrawerProps) {
  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-50 md:hidden"
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={cn(
          "fixed top-0 bottom-0 z-50 w-[85%] max-w-sm",
          "bg-surface shadow-2xl",
          "flex flex-col",
          "transition-transform duration-300",
          "md:hidden",
          position === "right" ? "right-0" : "left-0",
          open
            ? "translate-x-0"
            : position === "right"
            ? "translate-x-full"
            : "-translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between h-14 px-4 border-b border-border-main">
          {title && <h2 className="font-semibold">{title}</h2>}
          <button
            onClick={onClose}
            className="p-2 -mr-2 rounded-lg hover:bg-elevated transition-colors"
            aria-label="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>
    </>
  );
}

export default MobileHeader;

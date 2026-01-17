// features/mobile/components/BottomNav.tsx
/**
 * Bottom Navigation Component
 * شريط التنقل السفلي للموبايل
 */

"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { Link } from "@/src/app/i18n/navigation";
import {
  Home,
  Package,
  ShoppingCart,
  Users,
  BarChart3,
  LucideIcon,
} from "lucide-react";
import { cn } from "@/src/shared/utils/cn";
import { useIsMobile } from "../hooks/useMobile";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  badge?: number;
}

const defaultNavItems: NavItem[] = [
  { href: "/dashboard", label: "الرئيسية", icon: Home },
  { href: "/dashboard/products", label: "المنتجات", icon: Package },
  { href: "/dashboard/orders", label: "الطلبات", icon: ShoppingCart },
  { href: "/dashboard/customers", label: "العملاء", icon: Users },
  { href: "/dashboard/reports", label: "التقارير", icon: BarChart3 },
];

interface BottomNavProps {
  items?: NavItem[];
  className?: string;
  showOnDesktop?: boolean;
}

export function BottomNav({
  items = defaultNavItems,
  className,
  showOnDesktop = false,
}: BottomNavProps) {
  const pathname = usePathname();
  const isMobile = useIsMobile();

  // Hide on desktop unless explicitly shown
  if (!isMobile && !showOnDesktop) {
    return null;
  }

  const isActive = (href: string) => {
    // Remove locale prefix for comparison
    const cleanPathname = pathname.replace(/^\/(ar|en)/, "");
    const cleanHref = href;

    if (cleanHref === "/dashboard") {
      return cleanPathname === "/dashboard";
    }
    return cleanPathname.startsWith(cleanHref);
  };

  return (
    <>
      {/* Spacer to prevent content from being hidden behind nav */}
      <div className="h-20 md:hidden" />

      {/* Bottom Navigation */}
      <nav
        className={cn(
          "fixed bottom-0 left-0 right-0 z-50",
          "bg-surface border-t border-border-main",
          "pb-[env(safe-area-inset-bottom)]",
          "shadow-[0_-2px_10px_rgba(0,0,0,0.1)]",
          !showOnDesktop && "md:hidden",
          className
        )}
      >
        <div className="flex items-center justify-around h-16">
          {items.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative flex flex-col items-center justify-center",
                  "w-full h-full",
                  "transition-colors duration-200",
                  active ? "text-primary" : "text-secondary hover:text-main"
                )}
              >
                {/* Active indicator */}
                {active && (
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-primary rounded-b-full" />
                )}

                {/* Icon with badge */}
                <span className="relative">
                  <Icon className={cn("w-6 h-6", active && "scale-110")} />
                  {item.badge && item.badge > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center text-[10px] font-bold bg-danger text-white rounded-full px-1">
                      {item.badge > 99 ? "99+" : item.badge}
                    </span>
                  )}
                </span>

                {/* Label */}
                <span
                  className={cn(
                    "text-[10px] mt-1 font-medium",
                    active && "font-semibold"
                  )}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}

// FAB with Bottom Nav offset
interface FloatingActionButtonProps {
  icon: React.ReactNode;
  onClick: () => void;
  label?: string;
  className?: string;
}

export function FloatingActionButton({
  icon,
  onClick,
  label,
  className,
}: FloatingActionButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "fixed z-40",
        "bottom-24 right-4", // Above bottom nav
        "p-4 rounded-full",
        "bg-primary text-white",
        "shadow-lg shadow-primary/30",
        "transition-all duration-300",
        "active:scale-95",
        "flex items-center gap-2",
        className
      )}
      aria-label={label}
    >
      {icon}
      {label && <span className="text-sm font-medium pr-1">{label}</span>}
    </button>
  );
}

export default BottomNav;

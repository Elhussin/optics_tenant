/**
 * ✨ Aside Component - محسّن مع Animations و UI/UX Enhancements
 * @description Sidebar navigation محسّن مع glassmorphism وanimations متقدمة
 */

"use client";

import { useAside } from "@/src/shared/contexts/AsideContext";
import React from "react";
import { Link } from "@/src/app/i18n/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useUser } from "@/src/features/auth/hooks/UserContext";
import { X, ChevronRight, Sparkles } from "lucide-react";
import { URLDATA, navUrl } from "@/src/shared/constants/url";
import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";
import { usePathname } from "next/navigation";
import {
  Home,
  Shield,
  Eye,
  User,
  Users,
  Building2,
  BarChart3,
  Truck,
  Phone,
  Info,
  LogIn,
  UserPlus,
  Grid,
  LogOut,
} from "lucide-react";
import { cn } from "@/src/shared/utils/cn";

export default function Aside() {
  const locale = useLocale();
  const isRTL = locale === "ar";
  const { isVisible, asideContent, toggleAside } = useAside();

  return (
    <>
      {/* ✨ Enhanced Backdrop */}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={toggleAside}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          />
        )}
      </AnimatePresence>

      {/* ✨ Enhanced Sidebar */}
      <motion.aside
        initial={{ x: isRTL ? "100%" : "-100%" }}
        animate={{ x: isVisible ? "0%" : isRTL ? "100%" : "-100%" }}
        transition={{
          duration: 0.3,
          ease: [0.4, 0, 0.2, 1],
          type: "spring",
          stiffness: 300,
          damping: 30,
        }}
        className={cn(
          "fixed top-0 h-full w-80 z-50",
          "bg-background/95 backdrop-blur-xl",
          "border-2 border-border shadow-2xl",
          "overflow-hidden flex flex-col",
          isRTL ? "right-0" : "left-0"
        )}
      >
        {/* ✨ Enhanced Header */}
        <div
          className={cn(
            "flex items-center justify-between p-4",
            "border-b-2 border-border",
            "bg-elevated/50"
          )}
        >
          <div className="flex items-center gap-2">
            <div
              className={cn(
                "p-2 rounded-lg",
                "bg-gradient-to-br from-primary/20 to-primary/10",
                "animate-pulse-slow"
              )}
            >
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <span className="text-lg font-bold text-foreground">Menu</span>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleAside}
            className={cn(
              "p-2 rounded-xl",
              "text-muted-foreground hover:text-destructive",
              "hover:bg-destructive/10",
              "transition-all duration-200"
            )}
            aria-label="Close menu"
          >
            <X size={20} />
          </motion.button>
        </div>

        {/* ✨ Enhanced Content Area */}
        <div className={cn("flex-1 overflow-y-auto p-4", "scrollbar-thin")}>
          {asideContent ? asideContent : <AsideDefaultContent />}
        </div>
      </motion.aside>
    </>
  );
}

/**
 * ✨ AsideDefaultContent - محسّن مع staggered animations
 */
const AsideDefaultContent = () => {
  const t = useTranslations("aside");
  const { user } = useUser();
  const pathname = usePathname();
  const locale = useLocale();
  const isRTL = locale === "ar";

  // Helper to get icon based on path
  const getIcon = (path: string) => {
    const iconProps = { size: 20, strokeWidth: 2 };
    switch (path) {
      case "/":
        return <Home {...iconProps} />;
      case "/dashboard":
        return <Shield {...iconProps} />;
      case "/admin":
        return <Shield {...iconProps} />;
      case "/prescriptions":
        return <Eye {...iconProps} />;
      case "/profile":
        return <User {...iconProps} />;
      case "/users":
        return <Users {...iconProps} />;
      case "/tenants":
        return <Building2 {...iconProps} />;
      case "/groups":
        return <Users {...iconProps} />;
      case "/crm":
        return <BarChart3 {...iconProps} />;
      case "/products/supplier":
        return <Truck {...iconProps} />;
      case "/contact":
        return <Phone {...iconProps} />;
      case "/about":
        return <Info {...iconProps} />;
      case "/logout":
        return <LogOut {...iconProps} />;
      case "/auth/login":
        return <LogIn {...iconProps} />;
      case "/auth/register":
        return <UserPlus {...iconProps} />;
      default:
        return <Grid {...iconProps} />;
    }
  };

  /**
   * ✨ Enhanced NavItem with animations
   */
  const NavItem = ({
    item,
    index,
  }: {
    item: { path: string; name: string };
    index: number;
  }) => {
    const isActive = pathname === item.path;

    return (
      <motion.div
        initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.05 }}
      >
        <Link
          href={item.path}
          className={cn(
            "flex items-center gap-3 px-4 py-3 rounded-xl",
            "transition-all duration-200 group relative overflow-hidden",
            isActive
              ? [
                  "bg-primary/10 text-primary",
                  "font-semibold shadow-sm",
                  "border-2 border-primary/20",
                ]
              : [
                  "text-muted-foreground hover:text-foreground",
                  "hover:bg-elevated hover:shadow-sm",
                  "border-2 border-transparent hover:border-border",
                ]
          )}
        >
          {/* Active indicator */}
          {isActive && (
            <motion.div
              layoutId="active-sidebar"
              className={cn(
                "absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent",
                "rounded-xl"
              )}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
          )}

          {/* Icon */}
          <span
            className={cn(
              "relative z-10 transition-all duration-200",
              "group-hover:scale-110 group-hover:rotate-3",
              isActive && "text-primary scale-110"
            )}
          >
            {getIcon(item.path)}
          </span>

          {/* Label */}
          <span className="relative z-10 flex-1">{t(item.name)}</span>

          {/* Arrow indicator */}
          <ChevronRight
            className={cn(
              "relative z-10 w-0 opacity-0 transition-all duration-200",
              "group-hover:w-4 group-hover:opacity-100",
              isRTL && "rotate-180"
            )}
            size={16}
          />
        </Link>
      </motion.div>
    );
  };

  /**
   * ✨ User Profile Card (للـ logged in users)
   */
  const UserProfileCard = () => {
    if (!user) return null;

    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          "mb-6 p-4 rounded-2xl",
          "bg-gradient-to-br from-primary/10 via-primary/5 to-transparent",
          "border-2 border-primary/20",
          "shadow-sm"
        )}
      >
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "relative w-12 h-12 rounded-full",
              "bg-gradient-to-br from-primary to-primary/70",
              "flex items-center justify-center",
              "text-primary-foreground font-bold text-lg",
              "shadow-md ring-2 ring-primary/20"
            )}
          >
            {user.username?.[0]?.toUpperCase() || "U"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-foreground truncate">
              {user.username}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {user.email}
            </p>
          </div>
        </div>
      </motion.div>
    );
  };

  /**
   * ✨ Brand Card (للـ guest users)
   */
  const BrandCard = () => {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className={cn(
          "mt-8 rounded-2xl overflow-hidden",
          "bg-gradient-to-br from-primary/10 via-primary/5 to-transparent",
          "border-2 border-primary/20",
          "shadow-lg"
        )}
      >
        <div className="p-4 text-center">
          <div
            className={cn(
              "relative w-24 h-24 mx-auto mb-3",
              "bg-gradient-to-br from-primary/20 to-primary/10",
              "rounded-2xl p-2",
              "shadow-sm"
            )}
          >
            <Image
              src="/media/aside.png"
              alt="logo"
              width={120}
              height={60}
              className="w-full h-full object-contain drop-shadow-sm"
            />
          </div>
          <h3 className="font-semibold text-foreground mb-1">Optics Store</h3>
          <p className="text-xs text-muted-foreground">Management System</p>
        </div>
      </motion.div>
    );
  };

  return (
    <nav className="flex flex-col gap-2">
      {user ? (
        <>
          {/* User Profile Card */}
          <UserProfileCard />

          {/* Section Header */}
          <div
            className={cn(
              "px-4 py-2 mb-1",
              "flex items-center gap-2",
              "text-xs font-bold uppercase tracking-wider",
              "text-muted-foreground"
            )}
          >
            <div className="h-px flex-1 bg-border" />
            <span>Dashboard</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          {/* Navigation Items */}
          {URLDATA.map((item, index) => (
            <NavItem key={item.path} item={item} index={index} />
          ))}
        </>
      ) : (
        <>
          {/* Guest Navigation */}
          {navUrl.map((item, index) => (
            <NavItem key={item.path} item={item} index={index} />
          ))}

          {/* Brand Card */}
          <BrandCard />
        </>
      )}
    </nav>
  );
};

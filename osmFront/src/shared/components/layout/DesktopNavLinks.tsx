/**
 * ✨ DesktopNavLinks - محسّن مع Animations و UI/UX Enhancements
 * @description Desktop navigation محسّن مع theme colors و animations متقدمة
 */

"use client";
import { Link } from "@/src/app/i18n/navigation";
import { useUser } from "@/src/features/auth/hooks/UserContext";
import { useTranslations } from "next-intl";
import { useSearch } from "@/src/shared/contexts/SearchContext";
import { Search, X, Sparkles } from "lucide-react";
import { useSearchButton } from "@/src/shared/contexts/SearchButtonContext";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@/src/shared/utils/cn";

export default function DesktopNavLinks({
  subdomain,
}: {
  subdomain: string | null;
}) {
  const { user } = useUser();
  const t = useTranslations("navBar");
  const { toggleSearch, isSearchVisible } = useSearch();
  const { isVisible } = useSearchButton();
  const pathname = usePathname();

  /**
   * ✨ Enhanced NavItem with theme colors
   */
  const NavItem = ({
    href,
    children,
  }: {
    href: string;
    children: React.ReactNode;
  }) => {
    const isActive =
      pathname === href || (href !== "/" && pathname?.startsWith(href));

    return (
      <Link
        href={href}
        className={cn(
          "relative px-4 py-2.5 rounded-xl",
          "text-sm font-semibold",
          "transition-all duration-200 group",
          isActive
            ? "text-primary"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        {/* ✨ Active background with gradient */}
        {isActive && (
          <motion.span
            layoutId="nav-pill"
            className={cn(
              "absolute inset-0 z-[-1] rounded-xl",
              "bg-gradient-to-br from-primary/10 to-primary/5",
              "border-2 border-primary/20",
              "shadow-sm"
            )}
            transition={{
              type: "spring",
              bounce: 0.2,
              duration: 0.5,
              stiffness: 300,
              damping: 30,
            }}
          />
        )}

        {/* ✨ Hover background */}
        <span
          className={cn(
            "absolute inset-0 z-[-1] rounded-xl",
            "bg-elevated opacity-0",
            "group-hover:opacity-100 transition-opacity duration-200"
          )}
        />

        {/* Label */}
        <span className="relative z-10 flex items-center gap-1.5">
          {children}
          {isActive && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-1.5 h-1.5 rounded-full bg-primary"
            />
          )}
        </span>
      </Link>
    );
  };

  return (
    <div className="hidden md:flex gap-8 items-center justify-between w-full">
      {/* ✨ Enhanced Navigation Links */}
      <div className="flex gap-1 items-center">
        <NavItem href="/">{t("home")}</NavItem>
        {user && user.role === "ADMIN" && (
          <NavItem href="/admin">{t("admin")}</NavItem>
        )}
        {user && user.role === "TECHNICIAN" && (
          <NavItem href="/prescriptions">{t("technician")}</NavItem>
        )}
        {user && <NavItem href="/profile">{t("profile")}</NavItem>}
      </div>

      {/* ✨ Enhanced Search and Auth Actions */}
      <div className="flex gap-3 items-center">
        {user ? (
          <>
            {isVisible && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleSearch}
                className={cn(
                  "relative p-2.5 rounded-xl",
                  "transition-all duration-200",
                  isSearchVisible
                    ? "bg-destructive/10 text-destructive hover:bg-destructive/20"
                    : "bg-primary/10 text-primary hover:bg-primary/20",
                  "shadow-sm hover:shadow-md"
                )}
                title={isSearchVisible ? t("closeSearch") : t("search")}
                aria-label={isSearchVisible ? t("closeSearch") : t("search")}
              >
                <div className="relative w-5 h-5 flex items-center justify-center">
                  {/* Search Icon */}
                  <motion.div
                    animate={{
                      opacity: isSearchVisible ? 0 : 1,
                      scale: isSearchVisible ? 0.5 : 1,
                      rotate: isSearchVisible ? 90 : 0,
                    }}
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    <Search className="w-5 h-5" />
                  </motion.div>

                  {/* Close Icon */}
                  <motion.div
                    animate={{
                      opacity: isSearchVisible ? 1 : 0,
                      scale: isSearchVisible ? 1 : 0.5,
                      rotate: isSearchVisible ? 0 : -90,
                    }}
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    <X className="w-5 h-5" />
                  </motion.div>
                </div>
              </motion.button>
            )}
          </>
        ) : (
          <div className="flex items-center gap-3">
            {/* ✨ Enhanced Login Link */}
            <Link
              href="/auth/login"
              className={cn(
                "px-4 py-2 rounded-xl",
                "text-sm font-semibold",
                "text-muted-foreground hover:text-foreground",
                "hover:bg-elevated",
                "transition-all duration-200"
              )}
            >
              {t("login")}
            </Link>

            {/* ✨ Enhanced Register Button */}
            <Link
              href="/auth/register"
              className={cn(
                "relative px-5 py-2.5 rounded-xl overflow-hidden",
                "text-sm font-bold",
                "text-primary-foreground",
                "bg-gradient-to-br from-primary to-primary/80",
                "shadow-md hover:shadow-lg",
                "transition-all duration-200",
                "hover:scale-105 active:scale-95",
                "group"
              )}
            >
              {/* Shine effect */}
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700" />

              <span className="relative z-10 flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                {t("register")}
              </span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

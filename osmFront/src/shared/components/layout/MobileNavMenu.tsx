/**
 * ✨ MobileNavMenu - محسّن مع Animations و UI/UX Enhancements
 * @description Mobile navigation محسّن مع staggered animations و theme colors
 */

"use client";

import { Link } from "@/src/app/i18n/navigation";
import { useUser } from "@/src/features/auth/hooks/UserContext";
import LogoutButton from "../ui/buttons/logout";
import { useTranslations } from "next-intl";
import { useSearch } from "@/src/shared/contexts/SearchContext";
import { ActionButton } from "../ui/buttons";
import { Search, X, Sparkles } from "lucide-react";
import { useSearchButton } from "@/src/shared/contexts/SearchButtonContext";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/src/shared/utils/cn";

export default function MobileNavMenu({
  isMenuOpen,
  setIsMenuOpen,
  subdomain,
}: {
  isMenuOpen: boolean;
  setIsMenuOpen: (val: boolean) => void;
  subdomain: string | null;
}) {
  const { user, logout } = useUser();
  const { toggleSearch, isSearchVisible } = useSearch();
  const { isVisible } = useSearchButton();
  const t = useTranslations("navBar");

  /**
   * ✨ Enhanced MobileNavLink
   */
  const MobileNavLink = ({
    href,
    children,
    index,
  }: {
    href: string;
    children: React.ReactNode;
    index: number;
  }) => {
    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ delay: index * 0.05 }}
      >
        <Link
          href={href}
          onClick={() => setIsMenuOpen(false)}
          className={cn(
            "block px-4 py-3 rounded-xl",
            "text-base font-semibold",
            "text-foreground hover:text-primary",
            "hover:bg-primary/10",
            "transition-all duration-200",
            "border-2 border-transparent hover:border-primary/20"
          )}
        >
          {children}
        </Link>
      </motion.div>
    );
  };

  return (
    <AnimatePresence>
      {isMenuOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className={cn(
            "md:hidden overflow-hidden",
            "border-t-2 border-border",
            "bg-background/95 backdrop-blur-xl"
          )}
        >
          <div className="flex flex-col p-4 space-y-2">
            {/* ✨ Navigation Links */}
            <MobileNavLink href="/" index={0}>
              {t("home")}
            </MobileNavLink>

            {user ? (
              <>
                {user.role === "ADMIN" && (
                  <MobileNavLink href="/admin" index={1}>
                    {t("admin")}
                  </MobileNavLink>
                )}

                {user.role === "TECHNICIAN" && (
                  <MobileNavLink href="/prescriptions" index={2}>
                    {t("technician")}
                  </MobileNavLink>
                )}

                <MobileNavLink href="/profile" index={3}>
                  {t("profile")}
                </MobileNavLink>

                {/* ✨ Enhanced Actions Section */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className={cn(
                    "flex flex-col gap-2 pt-3 mt-3",
                    "border-t-2 border-border"
                  )}
                >
                  {/* Search Toggle */}
                  {isVisible && (
                    <button
                      onClick={() => {
                        toggleSearch();
                        setIsMenuOpen(false);
                      }}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 rounded-xl",
                        "text-base font-semibold",
                        "transition-all duration-200",
                        isSearchVisible
                          ? "bg-destructive/10 text-destructive hover:bg-destructive/20"
                          : "bg-primary/10 text-primary hover:bg-primary/20",
                        "border-2",
                        isSearchVisible
                          ? "border-destructive/20"
                          : "border-primary/20"
                      )}
                    >
                      {isSearchVisible ? <X size={20} /> : <Search size={20} />}
                      <span>
                        {isSearchVisible ? t("closeSearch") : t("search")}
                      </span>
                    </button>
                  )}

                  {/* Logout Button */}
                  <LogoutButton
                    logout={() => {
                      setIsMenuOpen(false);
                      logout();
                    }}
                  />
                </motion.div>
              </>
            ) : (
              /* ✨ Enhanced Auth Links for Guest */
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="flex flex-col gap-3 pt-3 mt-3 border-t-2 border-border"
              >
                {subdomain && (
                  <Link
                    href="/auth/login"
                    onClick={() => setIsMenuOpen(false)}
                    className={cn(
                      "px-4 py-3 rounded-xl text-center",
                      "text-base font-semibold",
                      "text-foreground hover:text-primary",
                      "hover:bg-primary/10",
                      "border-2 border-border hover:border-primary/20",
                      "transition-all duration-200"
                    )}
                  >
                    {t("login")}
                  </Link>
                )}

                <Link
                  href="/auth/register"
                  onClick={() => setIsMenuOpen(false)}
                  className={cn(
                    "relative px-5 py-3 rounded-xl overflow-hidden",
                    "text-center text-base font-bold",
                    "text-primary-foreground",
                    "bg-gradient-to-br from-primary to-primary/80",
                    "shadow-md hover:shadow-lg",
                    "transition-all duration-200",
                    "active:scale-95",
                    "group"
                  )}
                >
                  {/* Shine effect */}
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700" />

                  <span className="relative z-10 flex items-center justify-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    {t("register")}
                  </span>
                </Link>
              </motion.div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

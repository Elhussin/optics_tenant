/**
 * ✨ Header Component - محسّن مع Glassmorphism و UI/UX Enhancements
 * @description Header رئيسي محسّن مع auto-hide، glassmorphism، و animations متقدمة
 */

"use client";

import { useState, useEffect } from "react";
import ThemeToggle from "../ui/ThemeToggle";
import LocaleSwitcher from "../ui/LocaleSwitcher";
import Image from "next/image";
import { Link } from "@/src/app/i18n/navigation";
import { AsideButton } from "@/src/shared/components/ui/buttons/AsideButton";
import DesktopNavLinks from "./DesktopNavLinks";
import MobileNavMenu from "./MobileNavMenu";
import { AutoHideSearchOnRouteChange } from "../search/AutoHideSearchOnRouteChange";
import { getSubdomain } from "@/src/shared/utils/getSubdomain";
import { Menu, X, Sparkles } from "lucide-react";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { useUser } from "@/src/features/auth/hooks/UserContext";
import LogoutButton from "../ui/buttons/logout";
import { cn } from "@/src/shared/utils/cn";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [subdomain, setSubdomain] = useState<string | null>(null);
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { scrollY } = useScroll();
  const { user, logout } = useUser();

  useEffect(() => {
    setSubdomain(getSubdomain());
  }, []);

  // ✨ Auto-hide header on scroll down
  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious() || 0;

    // Set scrolled state for styling changes
    setScrolled(latest > 20);

    // Hide/show header based on scroll direction
    if (latest > previous && latest > 150) {
      setHidden(true);
    } else {
      setHidden(false);
    }
  });

  return (
    <motion.header
      variants={{
        visible: { y: 0 },
        hidden: { y: "-100%" },
      }}
      animate={hidden ? "hidden" : "visible"}
      transition={{
        duration: 0.3,
        ease: [0.4, 0, 0.2, 1],
      }}
      className={cn(
        "fixed top-0 z-40 w-full",
        "border-b-2 transition-all duration-300",
        scrolled
          ? "border-border bg-background/80 backdrop-blur-xl shadow-lg"
          : "border-transparent bg-background/60 backdrop-blur-md shadow-sm"
      )}
    >
      <AutoHideSearchOnRouteChange />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* ✨ Enhanced Logo & Aside Toggle */}
          <div className="flex shrink-0 items-center gap-3">
            <AsideButton />

            <Link
              href="/"
              className={cn(
                "flex items-center gap-2.5 group",
                "transition-all duration-200"
              )}
            >
              {/* Logo Container */}
              <div
                className={cn(
                  "relative overflow-hidden rounded-xl",
                  "border-2 border-border",
                  "shadow-md group-hover:shadow-lg",
                  "transition-all duration-200 group-hover:scale-105",
                  "bg-gradient-to-br from-primary/10 to-primary/5"
                )}
              >
                <Image
                  className="object-cover h-auto w-auto"
                  src="/media/icon.jpg"
                  alt="OSM Logo"
                  width={42}
                  height={42}
                  priority
                  title="O-S-M Optics Store Management"
                />

                {/* Shine effect on hover */}
                <span
                  className={cn(
                    "absolute inset-0",
                    "bg-gradient-to-r from-transparent via-white/30 to-transparent",
                    "translate-x-[-200%] group-hover:translate-x-[200%]",
                    "transition-transform duration-700"
                  )}
                />
              </div>

              {/* Logo Text */}
              <div className="hidden sm:flex flex-col">
                <span
                  className={cn(
                    "font-bold text-xl tracking-tight",
                    "bg-gradient-to-r from-foreground to-foreground/70",
                    "bg-clip-text text-transparent",
                    "group-hover:from-primary group-hover:to-primary/70",
                    "transition-all duration-200"
                  )}
                >
                  OSM
                </span>
                <span className="text-[10px] text-muted-foreground font-medium -mt-1">
                  Optics Store
                </span>
              </div>
            </Link>
          </div>

          {/* ✨ Desktop Navigation (Center) */}
          <div className="hidden md:flex flex-1 justify-center">
            <DesktopNavLinks subdomain={subdomain} />
          </div>

          {/* ✨ Enhanced Right Actions */}
          <div className="flex items-center gap-2">
            {/* Locale & Theme Switchers */}
            <div className="flex items-center gap-1.5">
              <LocaleSwitcher />
              <ThemeToggle />
            </div>

            {/* Desktop Logout */}
            {user && (
              <div className="hidden md:block">
                <LogoutButton logout={logout} />
              </div>
            )}

            {/* ✨ Enhanced Mobile Menu Toggle */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={cn(
                "md:hidden p-2.5 rounded-xl",
                "transition-all duration-200",
                "border-2",
                isMenuOpen
                  ? "bg-destructive/10 text-destructive border-destructive/20"
                  : "bg-primary/10 text-primary border-primary/20 hover:bg-primary/20",
                "shadow-sm hover:shadow-md"
              )}
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={isMenuOpen}
            >
              <motion.div
                animate={{ rotate: isMenuOpen ? 90 : 0 }}
                transition={{ duration: 0.2 }}
              >
                {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </motion.div>
            </motion.button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <MobileNavMenu
        isMenuOpen={isMenuOpen}
        setIsMenuOpen={setIsMenuOpen}
        subdomain={subdomain}
      />
    </motion.header>
  );
}

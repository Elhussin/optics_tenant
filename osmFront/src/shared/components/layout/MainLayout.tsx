/**
 * ✨ MainLayout - محسّن مع UI/UX Enhancements
 * @description Layout رئيسي محسّن مع scroll-to-top، theme colors، و animations
 */

"use client";

import { useState, useEffect } from "react";
import Header from "./Header";
import Footer from "./Footer";
import { Toaster } from "sonner";
import GlobalAlert from "../ui/GlobalAlert";
import { usePathname } from "next/navigation";
import Aside from "./Aside";
import { useAside } from "@/src/shared/contexts/AsideContext";
import { useLocale } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUp } from "lucide-react";
import { cn } from "@/src/shared/utils/cn";

interface Props {
  mainContent?: React.ReactNode;
}

export default function MainLayout({ mainContent }: Props) {
  const pathname = usePathname();
  const excluded = ["/auth/login", "/auth/register"];
  const showAside = !excluded.includes(pathname);
  const { isVisible } = useAside();
  const locale = useLocale();
  const isRTL = locale === "ar";

  // ✨ Scroll to top button state
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <div
      className={cn(
        "flex flex-col min-h-screen pt-16",
        "bg-background text-foreground"
      )}
    >
      {/* ✨ Header Container */}
      <div className="fixed top-0 left-0 w-full z-30">
        <Header />
      </div>

      {/* ✨ Main Content Area */}
      <div className="flex flex-1 min-h-0">
        {showAside && <Aside />}

        <main className="flex-1 min-w-0">
          <div
            className={cn(
              "container mx-auto",
              "p-4 sm:p-6 lg:p-8",
              "animate-fade-in-up"
            )}
          >
            {/* Global Alert */}
            <GlobalAlert />

            {/* Main Content */}
            {mainContent}

            {/* ✨ Enhanced Toaster */}
            <Toaster
              richColors
              closeButton
              position={isRTL ? "top-left" : "top-right"}
              duration={4000}
              toastOptions={{
                classNames: {
                  toast: cn(
                    "rounded-xl border-2 shadow-lg",
                    "backdrop-blur-md"
                  ),
                  title: "font-semibold",
                  description: "text-sm",
                  success: cn(
                    "bg-green-50 dark:bg-green-950/50 text-green-900 dark:text-green-100",
                    "border-green-200 dark:border-green-800"
                  ),
                  error: cn(
                    "bg-red-50 dark:bg-red-950/50 text-red-900 dark:text-red-100",
                    "border-red-200 dark:border-red-800"
                  ),
                  warning: cn(
                    "bg-yellow-50 dark:bg-yellow-950/50 text-yellow-900 dark:text-yellow-100",
                    "border-yellow-200 dark:border-yellow-800"
                  ),
                  info: cn(
                    "bg-blue-50 dark:bg-blue-950/50 text-blue-900 dark:text-blue-100",
                    "border-blue-200 dark:border-blue-800"
                  ),
                },
              }}
            />
          </div>
        </main>
      </div>

      {/* Footer */}
      <Footer />

      {/* ✨ Scroll to Top Button */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.5, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: 20 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={scrollToTop}
            className={cn(
              "fixed bottom-6 z-50",
              "p-3.5 rounded-full",
              "bg-gradient-to-br from-primary to-primary/80",
              "text-primary-foreground",
              "shadow-lg hover:shadow-xl",
              "transition-all duration-200",
              "group",
              isRTL ? "left-6" : "right-6"
            )}
            aria-label="Scroll to top"
          >
            <ArrowUp
              className={cn(
                "w-5 h-5",
                "transition-transform duration-200",
                "group-hover:-translate-y-1"
              )}
            />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * ✨ ThemeToggle - محسّن مع Animations و UI/UX Enhancements
 * @description Modern theme switcher مع color previews و enhanced design
 */

"use client";

import { useEffect, useState, useRef } from "react";
import { Palette, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/src/shared/utils/cn";
import { useTranslations } from "next-intl";
export const themes: { id: string; label: string; colors: string[] }[] = [
  {
    id: "theme-light",
    label: "Light",
    colors: ["#3b82f6", "#f3f4f6", "#1f2937"],
  },
  { id: "dark", label: "Dark", colors: ["#3b82f6", "#1f2937", "#f3f4f6"] },
  {
    id: "theme-ocean",
    label: "Ocean",
    colors: ["#0ea5e9", "#0c4a6e", "#e0f2fe"],
  },
  {
    id: "theme-green",
    label: "Green",
    colors: ["#10b981", "#065f46", "#d1fae5"],
  },
  {
    id: "theme-warm",
    label: "Warm",
    colors: ["#f59e0b", "#78350f", "#fef3c7"],
  },
  {
    id: "theme-forest",
    label: "Forest",
    colors: ["#059669", "#064e3b", "#d1fae5"],
  },
  {
    id: "theme-olive",
    label: "Olive",
    colors: ["#84cc16", "#365314", "#ecfccb"],
  },
];

/**
 * Theme toggle component
 * @description A modern, accessible dropdown to toggle the application theme.
 * @returns {JSX.Element}
 */
export default function ThemeToggle() {
  const t = useTranslations("theme");
  const [theme, setTheme] = useState("theme-light");
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Initialize theme from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved && themes.find((t) => t.id === saved)) {
      setTheme(saved);
      document.documentElement.className = saved;
    } else {
      document.documentElement.className = "theme-light";
    }
  }, []);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleThemeChange = (newThemeId: string) => {
    setTheme(newThemeId);
    document.documentElement.className = newThemeId;
    localStorage.setItem("theme", newThemeId);
    setIsOpen(false);
  };

  const activeTheme = themes.find((t) => t.id === theme);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* ✨ Enhanced Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "p-2.5 rounded-xl cursor-pointer select-none",
          "border-1 transition-all duration-200  border-primary/50",
          "focus:outline-none focus:ring-2 focus:ring-primary/50",
          isOpen
            ? "bg-primary/10 text-primary"
            : "bg-background  text-foreground hover:bg-elevated hover:border-primary/30"
        )}
        title={t("selectTheme")}
        aria-label={t("selectTheme")}
        aria-expanded={isOpen}
      >
        <Palette className="w-5 h-5" />
      </button>

      {/* ✨ Enhanced Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={cn(
              "absolute ltr:right-0 rtl:left-0 top-full mt-2 w-64",
              "bg-surface backdrop-blur-xl",
              "border-2 border-primary/50",
              "rounded-2xl shadow-2xl",
              "overflow-hidden z-50"
            )}
          >
            {/* Header */}
            <div
              className={cn(
                "px-4 py-3",
                "bg-elevated/50 backdrop-blur-md",
                "border-b-2 border-primary/50"
              )}
            >
              <p className="text-xs font-black uppercase tracking-wider text-muted-foreground">
                {t("theme")}
              </p>
              {activeTheme && (
                <p className="text-sm font-semibold text-foreground mt-1">
                  {t("current")}: {activeTheme.label}
                </p>
              )}
            </div>

            {/* ✨ Enhanced Theme Options */}
            <div
              className={cn(
                "max-h-[320px] overflow-y-auto",
                "scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent",
                "p-2"
              )}
            >
              {themes.map((t, index) => (
                <motion.button
                  key={t.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => handleThemeChange(t.id)}
                  className={cn(
                    "w-full px-3 py-3 mb-2 rounded-xl cursor-pointer select-none",
                    "flex items-center justify-between gap-3",
                    "transition-all duration-200",
                    "border-2",
                    theme === t.id
                      ? "bg-primary/10 border-primary/30 text-primary"
                      : "border-transparent hover:bg-elevated hover:border-primary/50"
                  )}
                  title={t.label}
                >
                  <div className="flex items-center gap-3 flex-1">
                    {/* ✨ Color Preview */}
                    <div className="flex gap-1">
                      {t.colors.map((color, i) => (
                        <div
                          key={i}
                          className="w-4 h-4 rounded-full border-2 border-white/20 shadow-sm"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>

                    {/* Label */}
                    <span
                      className={cn(
                        "text-sm font-semibold",
                        theme === t.id ? "text-primary" : "text-foreground"
                      )}
                    >
                      {t.label}
                    </span>
                  </div>

                  {/* Check Icon */}
                  {theme === t.id && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 500 }}
                    >
                      <Check className="w-5 h-5 text-primary" />
                    </motion.div>
                  )}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

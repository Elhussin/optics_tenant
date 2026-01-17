/**
 * ✨ LocaleSwitcher - محسّن مع Animations و UI/UX Enhancements
 * @description Language, country, and currency switcher مع enhanced design
 */

"use client";

import { useRouter, usePathname } from "@/src/app/i18n/navigation";
import { useLocale } from "next-intl";
import { useTransition, useEffect, useState, useRef } from "react";
import Cookies from "js-cookie";
import {
  languages,
  countries,
  currencies,
  currencyMap,
} from "@/src/shared/constants";
import {
  Loader2,
  Globe,
  ChevronDown,
  Check,
  MapPin,
  Coins,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/src/shared/utils/cn";
import { useClickOutside } from "@/src/shared/hooks/useClickOutside";

type Tab = "language" | "country" | "currency";

export default function LocaleSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();

  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("language");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useClickOutside(dropdownRef, () => setIsOpen(false));

  const defaultLanguage = process.env.DEFAULT_LANGUAGE || "en";
  const defaultCountry = process.env.DEFAULT_COUNTRY || "sa";
  const defaultCurrency = process.env.DEFAULT_CURRENCY || "sar";

  const [country, setCountry] = useState(
    Cookies.get("country") || defaultCountry
  );
  const [currency, setCurrency] = useState(
    Cookies.get("currency") || defaultCurrency
  );

  // Auto detect country on mount
  useEffect(() => {
    if (!Cookies.get("country")) handleAutoDetect();
  }, []);

  const handleAutoDetect = async () => {
    try {
      const res = await fetch("/api/geo");
      const data = await res.json();
      const detected = data.country_code?.toLowerCase();
      if (detected) {
        const matched = countries.find((c) => c.value === detected);
        if (matched) {
          setCountry(matched.value);
          setCurrency(currencyMap[matched.value] || defaultCurrency);
          Cookies.set("country", matched.value, { path: "/", expires: 30 });
          Cookies.set(
            "currency",
            currencyMap[matched.value] || defaultCurrency,
            { path: "/", expires: 30 }
          );
        }
      }
    } catch (e) {
      console.error("Auto detect failed", e);
    }
  };

  const handleLanguageChange = (newLang: string) => {
    if (newLang !== locale) {
      startTransition(() => {
        router.replace(pathname, { locale: newLang });
        setIsOpen(false);
      });
    }
  };

  const handleCountryChange = (selected: string) => {
    setCountry(selected);
    const newCurr = currencyMap[selected] || defaultCurrency;
    setCurrency(newCurr);
    Cookies.set("country", selected, { path: "/", expires: 30 });
    Cookies.set("currency", newCurr, { path: "/", expires: 30 });
  };

  const handleCurrencyChange = (selected: string) => {
    setCurrency(selected);
    Cookies.set("currency", selected, { path: "/", expires: 30 });
  };

  const activeLanLabel = languages
    .find((l) => l.value === locale)
    ?.label.substring(0, 3)
    .toUpperCase();

  return (
    <div className="relative" ref={dropdownRef}>
      {/* ✨ Enhanced Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-2 px-4 py-2.5",
          "text-sm font-semibold",
          "rounded-xl border-1 transition-all duration-200",
          isOpen
            ? "bg-elevated border-primary/50 text-foreground"
            : "bg-background border-primary/50 text-foreground hover:bg-elevated hover:border-primary/30"
        )}
      >
        <Globe size={18} className="text-primary" />
        <span>{activeLanLabel}</span>
        <span className="w-px h-4 bg-border mx-1" />
        <span className="uppercase text-xs text-muted-foreground">
          {country}
        </span>
        {isPending ? (
          <Loader2 size={14} className="animate-spin ml-1 text-primary" />
        ) : (
          <ChevronDown
            size={14}
            className={cn(
              "transition-transform duration-200 text-muted-foreground",
              isOpen && "rotate-180"
            )}
          />
        )}
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
              "absolute end-0 top-full mt-2 w-96",
              "bg-surface backdrop-blur-xl",
              "rounded-2xl shadow-2xl",
              "border-2 border-primary/50",
              "p-4 z-50",
              "ltr:origin-top-right rtl:origin-top-left"
            )}
          >
            {/* ✨ Enhanced Tabs */}
            <div className={cn("flex p-1 mb-4", "bg-elevated rounded-xl")}>
              {(["language", "country", "currency"] as Tab[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    "flex-1 flex items-center justify-center py-2 px-3",
                    "text-xs font-bold rounded-lg",
                    "transition-all duration-200",
                    activeTab === tab
                      ? "bg-primary text-primary-foreground shadow-lg"
                      : "text-muted-foreground hover:text-foreground hover:bg-background"
                  )}
                >
                  {tab === "language" && <Globe size={12} className="mr-1.5" />}
                  {tab === "country" && <MapPin size={12} className="mr-1.5" />}
                  {tab === "currency" && <Coins size={12} className="mr-1.5" />}
                  <span className="capitalize">{tab}</span>
                </button>
              ))}
            </div>

            {/* ✨ Enhanced Content */}
            <div
              className={cn(
                "space-y-1 max-h-60 overflow-y-auto",
                "scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent",
                "px-1"
              )}
            >
              {/* Language Options */}
              {activeTab === "language" &&
                languages.map((l) => (
                  <motion.button
                    key={l.value}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2 }}
                    onClick={() => handleLanguageChange(l.value)}
                    className={cn(
                      "w-full flex items-center justify-between",
                      "px-3 py-2.5 rounded-xl text-sm font-medium",
                      "transition-all duration-200",
                      locale === l.value
                        ? "bg-primary/10 text-primary border-2 border-primary/20"
                        : "hover:bg-elevated text-foreground border-2 border-transparent"
                    )}
                  >
                    <span className="flex items-center gap-2">
                      <span className="text-lg">{l.label.split(" ")[0]}</span>
                      {l.label}
                    </span>
                    {locale === l.value && (
                      <Check size={16} className="text-primary" />
                    )}
                  </motion.button>
                ))}

              {/* Country Options */}
              {activeTab === "country" &&
                countries.map((c) => (
                  <motion.button
                    key={c.value}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2 }}
                    onClick={() => handleCountryChange(c.value)}
                    className={cn(
                      "w-full flex items-center justify-between",
                      "px-3 py-2.5 rounded-xl text-sm font-medium",
                      "transition-all duration-200",
                      country === c.value
                        ? "bg-primary/10 text-primary border-2 border-primary/20"
                        : "hover:bg-elevated text-foreground border-2 border-transparent"
                    )}
                  >
                    <span className="flex items-center gap-2">{c.label}</span>
                    {country === c.value && (
                      <Check size={16} className="text-primary" />
                    )}
                  </motion.button>
                ))}

              {/* Currency Options */}
              {activeTab === "currency" &&
                currencies.map((c) => (
                  <motion.button
                    key={c.value}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2 }}
                    onClick={() => handleCurrencyChange(c.value)}
                    className={cn(
                      "w-full flex items-center justify-between",
                      "px-3 py-2.5 rounded-xl text-sm font-medium",
                      "transition-all duration-200",
                      currency === c.value
                        ? "bg-primary/10 text-primary border-2 border-primary/20"
                        : "hover:bg-elevated text-foreground border-2 border-transparent"
                    )}
                  >
                    <span className="flex items-center gap-2">{c.label}</span>
                    {currency === c.value && (
                      <Check size={16} className="text-primary" />
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

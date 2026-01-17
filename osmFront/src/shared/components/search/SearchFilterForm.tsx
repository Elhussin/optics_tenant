/**
 * ✨ SearchFilterForm - محسّن مع Animations و UI/UX Enhancements
 * @description نموذج بحث وفلترة متقدم مع تحسينات بصرية شاملة
 */

"use client";

import { useState, useEffect, useMemo } from "react";
import { ActionButton } from "../ui/buttons";
import { useRouter, useSearchParams } from "next/navigation";
import { useSearch } from "@/src/shared/contexts/SearchContext";
import { motion, AnimatePresence } from "framer-motion";
import { Search, SearchX, Filter, X, RotateCcw } from "lucide-react";
import { cn } from "@/src/shared/utils/cn";

interface Props {
  fields: any[];
  setFilters: (filters: Record<string, string>) => void;
}

export const SearchFilterForm = ({ fields, setFilters }: Props) => {
  const router = useRouter();
  const { isSearchVisible } = useSearch();
  const searchParams = useSearchParams();

  /**
   * Build initial form state from URL query (ignore pagination params)
   */
  const initialForm = useMemo(() => {
    const obj: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      if (key === "page" || key === "page_size" || key === "all") return;
      obj[key] = value as string;
    });
    return obj;
  }, [searchParams]);

  const [form, setForm] = useState<Record<string, string>>(initialForm);
  const [resetKey, setResetKey] = useState<number>(0);

  // Keep form in sync when URL changes (e.g., back/forward navigation)
  useEffect(() => {
    setForm(initialForm);
  }, [initialForm]);

  const handleChange = (name: string, value: string) => {
    const newForm = { ...form, [name]: value };
    setForm(newForm);

    const filters: Record<string, string> = {};
    Object.entries(newForm).forEach(([key, val]) => {
      if (!val) return;
      if (key.includes("id")) {
        filters[key] = val;
      } else if (key === "search") {
        if (val.length < 3) return;
        filters[key] = val;
      } else {
        filters[key] = val;
      }
    });
    setFilters(filters);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const filters: Record<string, string> = {};
    Object.entries(form).forEach(([key, value]) => {
      if (!value) return;
      if (key.includes("id")) {
        filters[key] = value;
      } else if (key === "search") {
        filters[key] = value;
      } else {
        filters[key] = value;
      }
    });
    setFilters(filters);
  };

  const handleClear = () => {
    setForm({});
    setResetKey((k) => k + 1);
    setFilters({});
    router.push("?");
  };

  // Count active filters
  const activeFiltersCount = Object.values(form).filter(Boolean).length;

  if (!isSearchVisible) return null;

  return (
    <AnimatePresence>
      {isSearchVisible && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="overflow-hidden"
        >
          <form
            key={resetKey}
            className={cn(
              "p-6 bg-elevated/50 backdrop-blur-md",
              "border-b-2 border-border",
              "shadow-sm"
            )}
            onSubmit={handleSubmit}
          >
            <div className="max-w-7xl mx-auto space-y-5">
              {/* ✨ Enhanced Search Bar */}
              <div className="relative group max-w-3xl mx-auto animate-fade-in-up">
                <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none z-10">
                  <Search
                    className={cn(
                      "h-5 w-5 transition-all duration-300",
                      "text-muted-foreground group-focus-within:text-primary group-focus-within:scale-110"
                    )}
                  />
                </div>
                <input
                  type="text"
                  className={cn(
                    "block w-full pl-14 pr-14 py-4",
                    "bg-background border-2 border-border rounded-2xl",
                    "shadow-sm hover:shadow-md",
                    "placeholder:text-muted-foreground",
                    "text-base font-medium text-foreground",
                    "outline-none transition-all duration-300",
                    "focus:ring-4 focus:ring-primary/10 focus:border-primary",
                    "hover:border-primary/50"
                  )}
                  onChange={(e) => handleChange("search", e.target.value)}
                  value={form["search"] || ""}
                  placeholder="🔍 ابحث عن أي شيء..."
                  autoComplete="off"
                />
                {form["search"] && (
                  <motion.button
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    type="button"
                    onClick={() => handleChange("search", "")}
                    className={cn(
                      "absolute inset-y-0 right-3 flex items-center",
                      "p-2 rounded-xl",
                      "text-muted-foreground hover:text-destructive",
                      "hover:bg-destructive/10",
                      "transition-all duration-200 hover-scale"
                    )}
                    aria-label="Clear search"
                  >
                    <X className="h-5 w-5" />
                  </motion.button>
                )}
              </div>

              {/* ✨ Enhanced Advanced Filters */}
              {fields.length > 0 && (
                <motion.div
                  className="pt-2"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  {/* Filter Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className={cn(
                        "flex items-center gap-2.5",
                        "text-sm font-bold uppercase tracking-wider",
                        "text-muted-foreground"
                      )}
                    >
                      <div
                        className={cn(
                          "p-1.5 rounded-lg",
                          "bg-primary/10 text-primary"
                        )}
                      >
                        <Filter className="w-4 h-4" />
                      </div>
                      <span>Filters</span>
                      {activeFiltersCount > 0 && (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className={cn(
                            "px-2.5 py-0.5 rounded-full",
                            "bg-primary text-primary-foreground",
                            "text-xs font-semibold",
                            "animate-pulse-slow"
                          )}
                        >
                          {activeFiltersCount}
                        </motion.span>
                      )}
                    </div>

                    {/* Clear All Button */}
                    {activeFiltersCount > 0 && (
                      <motion.button
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        type="button"
                        onClick={handleClear}
                        className={cn(
                          "flex items-center gap-2 px-3 py-1.5",
                          "text-xs font-semibold",
                          "text-muted-foreground hover:text-destructive",
                          "border-2 border-border hover:border-destructive/50",
                          "rounded-lg",
                          "transition-all duration-200 hover-scale",
                          "hover:bg-destructive/5"
                        )}
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        Clear All
                      </motion.button>
                    )}
                  </div>

                  {/* Filter Fields Grid */}
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {fields.map((field, index) => (
                      <motion.div
                        key={field.name}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="group relative"
                      >
                        {/* Floating Label */}
                        <label
                          className={cn(
                            "absolute -top-2.5 left-3 px-2 z-10",
                            "bg-elevated",
                            "text-xs font-semibold",
                            "text-muted-foreground group-focus-within:text-primary",
                            "transition-colors duration-200"
                          )}
                        >
                          {field.label}
                        </label>

                        {/* Field Input */}
                        {field.type === "select" && field.options ? (
                          <select
                            className={cn(
                              "w-full h-11",
                              "bg-background border-2 border-border",
                              "rounded-lg px-4 py-2.5",
                              "text-sm font-medium text-foreground",
                              "outline-none appearance-none cursor-pointer",
                              "transition-all duration-200",
                              "focus:ring-2 focus:ring-primary/20 focus:border-primary",
                              "hover:border-primary/50 hover:shadow-sm",
                              form[field.name] && "border-primary bg-primary/5"
                            )}
                            onChange={(e) =>
                              handleChange(field.name, e.target.value)
                            }
                            value={form[field.name] || ""}
                          >
                            <option value="">All {field.label}</option>
                            {field.options.map((opt: any) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type="text"
                            className={cn(
                              "w-full h-11",
                              "bg-background border-2 border-border",
                              "rounded-lg px-4 py-2.5",
                              "text-sm font-medium text-foreground",
                              "placeholder:text-muted-foreground",
                              "outline-none transition-all duration-200",
                              "focus:ring-2 focus:ring-primary/20 focus:border-primary",
                              "hover:border-primary/50 hover:shadow-sm",
                              form[field.name] && "border-primary bg-primary/5"
                            )}
                            onChange={(e) =>
                              handleChange(field.name, e.target.value)
                            }
                            value={form[field.name] || ""}
                            placeholder={`Enter ${field.label.toLowerCase()}...`}
                          />
                        )}

                        {/* Clear Field Button */}
                        {form[field.name] && (
                          <button
                            type="button"
                            onClick={() => handleChange(field.name, "")}
                            className={cn(
                              "absolute top-3 right-3",
                              "p-1 rounded-md",
                              "text-muted-foreground hover:text-destructive",
                              "hover:bg-destructive/10",
                              "transition-all duration-200",
                              "opacity-0 group-hover:opacity-100",
                              "focus:opacity-100"
                            )}
                            aria-label={`Clear ${field.label}`}
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
          </form>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

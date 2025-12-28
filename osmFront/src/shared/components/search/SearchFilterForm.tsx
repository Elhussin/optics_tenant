
"use client";

import { useState } from "react";
import { ActionButton } from "../ui/buttons";
import { useRouter } from "next/navigation";
import { useSearch } from "@/src/shared/contexts/SearchContext";
interface Props {
  fields: any[];
  setFilters: (filters: Record<string, string>) => void;
}


// ... imports
import { motion, AnimatePresence } from "framer-motion";
import { Search, SearchX, Filter } from "lucide-react";

export const SearchFilterForm = ({ fields, setFilters }: Props) => {
  const router = useRouter();
  const [form, setForm] = useState<Record<string, string>>({});
  const [resetKey, setResetKey] = useState<number>(0);
  const { isSearchVisible } = useSearch();

  const handleChange = (name: string, value: string) => {
    const newForm = {
      ...form, // Uses current state from closure
      [name]: value,
    };

    setForm(newForm);

    // تحديث الفلاتر مباشرة عند أي تغيير
    const filters: Record<string, string> = {};
    Object.entries(newForm).forEach(([key, val]) => {
      if (!val) return;
      if (key.includes("id")) {
        filters[key] = val;
      } else if (key === "search") {
        if (val.length < 3) return;
        filters[key] = val;
      } else {
        filters[`${key}`] = val;
      }
    });

    setFilters(filters);
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // ✅ تجهيز الفلاتر مع مراعاة __icontains
    const filters: Record<string, string> = {};

    Object.entries(form).forEach(([key, value]) => {
      if (!value) return; // تجاهل الفارغ

      if (key.includes("id")) {
        filters[key] = value;
      } else if (key === "search") {
        filters[key] = value;
      } else {
        filters[`${key}`] = value;
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
            className="p-5 bg-gray-50/50 dark:bg-gray-800/50 backdrop-blur-sm border-b border-gray-100 dark:border-gray-800"
      onSubmit={handleSubmit}
    >
            <div className="max-w-7xl mx-auto space-y-4">

              {/* Search Bar - Hero Element */}
              <div className="relative group max-w-2xl mx-auto">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400 group-focus-within:text-primary transition-colors" />
                </div>
    <input
      type="text"
                  className="block w-full pl-11 pr-12 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-full shadow-sm placeholder:text-gray-400 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-base"
      onChange={(e) => handleChange("search", e.target.value)}
      value={form["search"] || ""}
                  placeholder="Search specifically..."
    />
                {form["search"] && (
    <button
                    type="button"
      onClick={handleClear}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    <div className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-red-500 transition-colors">
                       <SearchX className="h-4 w-4" />
                    </div>
    </button>
                )}
</div>

              {/* Advanced Filters */}
              {fields.length > 0 && (
                <div className="pt-2">
                  <div className="flex items-center gap-2 mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    <Filter className="w-3 h-3" /> Filters
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {fields.map((field) => (
                      <div key={field.name} className="group relative">
                         <label className="absolute -top-2 left-3 px-1 bg-gray-50 dark:bg-gray-900 text-xs font-medium text-gray-500 group-focus-within:text-primary transition-colors z-10">
            {field.label}
          </label>
          {field.type === "select" && field.options ? (
            <select
                            className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all appearance-none cursor-pointer"
              onChange={(e) => handleChange(field.name, e.target.value)}
              value={form[field.name] || ""}
            >
                            <option value="">All {field.label}</option>
              {field.options.map((opt: any) => (
                <option key={`${opt.value}_`} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          ) : (
            <input
              type="text"
                            className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all"
              onChange={(e) => handleChange(field.name, e.target.value)}
              value={form[field.name] || ""}
            />
          )}
        </div>
      ))}
                  </div>
                </div>
              )}
            </div>
    </form>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

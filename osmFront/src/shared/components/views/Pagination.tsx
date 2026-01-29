"use client";

import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ChevronDown,
  List,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/src/shared/utils/cn";

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  pageSize?: number;
  onPageSizeChange?: (size: number) => void;
}

export function Pagination({
  page,
  totalPages,
  onPageChange,
  pageSize = 10,
  onPageSizeChange,
}: PaginationProps) {
  const t = useTranslations("pagination");
  const getPages = () => {
    const pages: (number | string)[] = [];

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (page > 3) pages.push("...");
      for (
        let i = Math.max(2, page - 1);
        i <= Math.min(totalPages - 1, page + 1);
        i++
      ) {
        pages.push(i);
      }
      if (page < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-6 mt-8 w-full select-none animate-fade-in">
      {/* Items Per Page Selector */}
      {onPageSizeChange && (
        <div className="glass px-4 py-2.5 rounded-xl border border-border-main shadow-soft hover:shadow-md transition-all duration-200 group">
          <div className="flex items-center gap-3 text-sm">
            <List size={16} className="text-primary shrink-0" />
            <span className="text-secondary font-medium whitespace-nowrap">
              {t("rowsPerPage")}:
            </span> 
            <div className="relative">
              <select
                value={pageSize}
                onChange={(e) => onPageSizeChange(Number(e.target.value))}
                className={cn(
                  "appearance-none bg-transparent pl-2 pr-7 py-0.5",
                  "focus:outline-none cursor-pointer",
                  "text-main font-semibold",
                  "transition-colors"
                )}
              >
                {[5, 10, 20, 50, 100].map((size) => (
                  <option
                    key={size}
                    value={size}
                    className="bg-elevated text-main"
                  >
                    {size}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={14}
                className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-secondary transition-transform group-hover:translate-y-[-40%]"
              />
            </div>
          </div>
        </div>
      )}

      {/* Pagination Controls */}
      <nav className="glass p-2 rounded-2xl border border-border-main shadow-soft">
        <div className="flex items-center gap-1">
          {/* First & Prev */}
          <div className="flex items-center gap-1 mr-1 pr-2 border-r border-border-main/50">
            <button
              onClick={() => onPageChange(1)}
              disabled={page === 1}
              className={cn(
                "p-2 rounded-xl transition-all duration-200",
                "hover:bg-primary/10 hover:text-primary",
                "disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed",
                "active:scale-95",
                page === 1 ? "text-secondary" : "text-main"
              )}
              title={t("firstPage") || "First Page"}
            >
              <ChevronsLeft size={18} />
            </button>
            <button
              onClick={() => onPageChange(Math.max(1, page - 1))}
              disabled={page === 1}
              className={cn(
                "p-2 rounded-xl transition-all duration-200",
                "hover:bg-primary/10 hover:text-primary",
                "disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed",
                "active:scale-95",
                page === 1 ? "text-secondary" : "text-main"
              )}
              title={t("previousPage") || "Previous"}
            >
              <ChevronLeft size={18} />
            </button>
          </div>

          {/* Page Numbers */}
          <div className="flex items-center gap-1 px-1">
            {getPages().map((p, idx) =>
              p === "..." ? (
                <span
                  key={`dots-${idx}`}
                  className="px-2 text-secondary/50 text-sm pb-1 select-none"
                >
                  •••
                </span>
              ) : (
                <button
                  key={p}
                  onClick={() => onPageChange(Number(p))}
                  className={cn(
                    "min-w-[40px] h-10 px-2 rounded-xl text-sm font-semibold",
                    "transition-all duration-300 flex items-center justify-center",
                    "active:scale-95",
                    p === page
                      ? "bg-primary text-white shadow-lg shadow-primary/30 scale-105 hover:shadow-xl"
                      : "text-main hover:bg-primary/10 hover:text-primary hover:scale-105"
                  )}
                >
                  {p}
                </button>
              )
            )}
          </div>

          {/* Next & Last */}
          <div className="flex items-center gap-1 ml-1 pl-2 border-l border-border-main/50">
            <button
              onClick={() => onPageChange(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className={cn(
                "p-2 rounded-xl transition-all duration-200",
                "hover:bg-primary/10 hover:text-primary",
                "disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed",
                "active:scale-95",
                page === totalPages ? "text-secondary" : "text-main"
              )}
              title={t("nextPage") || "Next"}
            >
              <ChevronRight size={18} />
            </button>
            <button
              onClick={() => onPageChange(totalPages)}
              disabled={page === totalPages}
              className={cn(
                "p-2 rounded-xl transition-all duration-200",
                "hover:bg-primary/10 hover:text-primary",
                "disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed",
                "active:scale-95",
                page === totalPages ? "text-secondary" : "text-main"
              )}
              title={t("lastPage") || "Last Page"}
            >
              <ChevronsRight size={18} />
            </button>
          </div>
        </div>
      </nav>
    </div>
  );
}

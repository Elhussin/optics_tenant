"use client";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ChevronDown } from "lucide-react";
import { useTranslations } from 'next-intl';

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
  const getPages = () => {
    const pages: (number | string)[] = [];

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (page > 3) pages.push("...");
      for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
        pages.push(i);
      }
      if (page < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-4 mt-8 w-full select-none px-1">

      {/* Items Per Page Selector */}
      {onPageSizeChange && (
        <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400 font-medium bg-white dark:bg-gray-800 py-1.5 px-3 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm transition-all hover:border-gray-300 dark:hover:border-gray-600">
          <span className="whitespace-nowrap">Rows per page:</span>
          <div className="relative">
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="appearance-none bg-transparent pl-2 pr-6 py-0.5 focus:outline-none cursor-pointer text-gray-800 dark:text-gray-200 font-semibold"
            >
              {[5, 10, 20, 50, 100].map((size) => (
                <option key={size} value={size} className="bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200">
                  {size}
                </option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400" />
          </div>
        </div>
      )}

      {/* Pagination Controls */}
      <nav className="flex items-center gap-1 p-1.5 rounded-2xl bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700">

        {/* First & Prev */}
        <div className="flex items-center mr-1">
          <button
            onClick={() => onPageChange(1)}
            disabled={page === 1}
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-blue-600 dark:hover:text-blue-400 disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-gray-500 transition-all duration-200"
            title="First Page"
          >
            <ChevronsLeft size={18} />
          </button>
          <button
            onClick={() => onPageChange(Math.max(1, page - 1))}
            disabled={page === 1}
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-blue-600 dark:hover:text-blue-400 disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-gray-500 transition-all duration-200"
            title="Previous Page"
          >
            <ChevronLeft size={18} />
          </button>
        </div>

        {/* Page Numbers */}
        <div className="flex items-center gap-1 px-1">
          {getPages().map((p, idx) =>
            p === "..." ? (
              <span key={`dots-${idx}`} className="px-2 text-gray-300 dark:text-gray-600 text-sm pb-2">
                •••
              </span>
            ) : (
              <button
                key={p}
                onClick={() => onPageChange(Number(p))}
                className={`
                  min-w-[36px] h-9 px-1 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center justify-center
                  ${p === page
                    ? "bg-gradient-to-tr from-blue-600 to-blue-500 text-white shadow-md shadow-blue-500/30 scale-105"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-blue-600 dark:hover:text-blue-400"
                  }
                `}
              >
                {p}
              </button>
            )
          )}
        </div>

        {/* Next & Last */}
        <div className="flex items-center ml-1">
          <button
            onClick={() => onPageChange(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-blue-600 dark:hover:text-blue-400 disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-gray-500 transition-all duration-200"
            title="Next Page"
          >
            <ChevronRight size={18} />
          </button>
          <button
            onClick={() => onPageChange(totalPages)}
            disabled={page === totalPages}
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-blue-600 dark:hover:text-blue-400 disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-gray-500 transition-all duration-200"
            title="Last Page"
          >
            <ChevronsRight size={18} />
          </button>
        </div>
      </nav>
    </div>
  );
}

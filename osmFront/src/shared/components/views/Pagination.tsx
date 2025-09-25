"use client";
import React from "react";
import { PaginationProps } from "@/src/shared/types";



export function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  // دالة لتوليد الصفحات (بما فيها "..." للتقصير)
  const getPages = () => {
    const pages: (number | string)[] = [];

    if (totalPages <= 7) {
      // لو عدد الصفحات قليل
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // أول صفحة
      pages.push(1);

      // النقاط قبل الصفحة الحالية
      if (page > 3) pages.push("...");

      // الصفحات القريبة من الصفحة الحالية
      for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
        pages.push(i);
      }

      // النقاط بعد الصفحة الحالية
      if (page < totalPages - 2) pages.push("...");

      // آخر صفحة
      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <div className="flex items-center justify-center gap-2 mt-6">
      {/* زر السابق */}
      <button
        onClick={() => onPageChange(Math.max(1, page - 1))}
        disabled={page === 1}
        className={`px-3 py-1 rounded-lg border text-sm font-medium transition 
          ${page === 1
            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
            : "bg-white text-gray-700 hover:bg-gray-100 border-gray-300"
          }`}
      >
        Prev
      </button>

      {/* أرقام الصفحات */}
      {getPages().map((p, idx) =>
        p === "..." ? (
          <span key={idx} className="px-2 text-gray-500">...</span>
        ) : (
          <button
            key={p}
            onClick={() => onPageChange(Number(p))}
            className={`px-3 py-1 rounded-lg border text-sm font-medium transition 
              ${p === page
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-gray-700 hover:bg-gray-100 border-gray-300"
              }`}
          >
            {p}
          </button>
        )
      )}

      {/* زر التالي */}
      <button
        onClick={() => onPageChange(Math.min(totalPages, page + 1))}
        disabled={page === totalPages}
        className={`px-3 py-1 rounded-lg border text-sm font-medium transition 
          ${page === totalPages
            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
            : "bg-white text-gray-700 hover:bg-gray-100 border-gray-300"
          }`}
      >
        Next
      </button>
    </div>
  );
}

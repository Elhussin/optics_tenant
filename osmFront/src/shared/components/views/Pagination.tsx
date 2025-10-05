"use client";
// import React from "react";
// import { PaginationProps } from "@/src/shared/types";



// export function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
//   // دالة لتوليد الصفحات (بما فيها "..." للتقصير)
//   const getPages = () => {
//     const pages: (number | string)[] = [];

//     if (totalPages <= 7) {
//       // لو عدد الصفحات قليل
//       for (let i = 1; i <= totalPages; i++) {
//         pages.push(i);
//       }
//     } else {
//       // أول صفحة
//       pages.push(1);

//       // النقاط قبل الصفحة الحالية
//       if (page > 3) pages.push("...");

//       // الصفحات القريبة من الصفحة الحالية
//       for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
//         pages.push(i);
//       }

//       // النقاط بعد الصفحة الحالية
//       if (page < totalPages - 2) pages.push("...");

//       // آخر صفحة
//       pages.push(totalPages);
//     }

//     return pages;
//   };

//   return (
//     <div className="flex items-center justify-center gap-2 mt-6">
//       {/* زر السابق */}
//       <button
//         onClick={() => onPageChange(Math.max(1, page - 1))}
//         disabled={page === 1}
//         className={`px-3 py-1 rounded-lg border text-sm font-medium transition 
//           ${page === 1
//             ? "bg-gray-100 text-gray-400 cursor-not-allowed"
//             : "bg-white text-gray-700 hover:bg-gray-100 border-gray-300"
//           }`}
//       >
//         Prev
//       </button>

//       {/* أرقام الصفحات */}
//       {getPages().map((p, idx) =>
//         p === "..." ? (
//           <span key={idx} className="px-2 text-gray-500">...</span>
//         ) : (
//           <button
//             key={p}
//             onClick={() => onPageChange(Number(p))}
//             className={`px-3 py-1 rounded-lg border text-sm font-medium transition 
//               ${p === page
//                 ? "bg-blue-600 text-white border-blue-600"
//                 : "bg-white text-gray-700 hover:bg-gray-100 border-gray-300"
//               }`}
//           >
//             {p}
//           </button>
//         )
//       )}

//       {/* زر التالي */}
//       <button
//         onClick={() => onPageChange(Math.min(totalPages, page + 1))}
//         disabled={page === totalPages}
//         className={`px-3 py-1 rounded-lg border text-sm font-medium transition 
//           ${page === totalPages
//             ? "bg-gray-100 text-gray-400 cursor-not-allowed"
//             : "bg-white text-gray-700 hover:bg-gray-100 border-gray-300"
//           }`}
//       >
//         Next
//       </button>
//     </div>
//   );
// }
// interface PaginationProps {
//   page: number;
//   totalPages: number;
//   onPageChange: (page: number) => void;
//   pageSize?: number;
//   onPageSizeChange?: (size: number) => void;
// }

// export function Pagination({
//   page,
//   totalPages,
//   onPageChange,
//   pageSize = 10,
//   onPageSizeChange,
// }: PaginationProps) {
//   // 🔹 دالة لتوليد الصفحات
//   const getPages = () => {
//     const pages: (number | string)[] = [];

//     if (totalPages <= 7) {
//       for (let i = 1; i <= totalPages; i++) pages.push(i);
//     } else {
//       pages.push(1);
//       if (page > 3) pages.push("...");
//       for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
//         pages.push(i);
//       }
//       if (page < totalPages - 2) pages.push("...");
//       pages.push(totalPages);
//     }

//     return pages;
//   };

//   return (
//     <div className="flex flex-col md:flex-row items-center justify-center gap-4 mt-6">
//       {/* 🔹 التحكم في عدد العناصر */}
//       {onPageSizeChange && (
//         <div className="flex items-center gap-2">
//           <span className="text-sm text-gray-600">Items per page:</span>
//           <select
//             value={pageSize}
//             onChange={(e) => onPageSizeChange(Number(e.target.value))}
//             className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500"
//           >
//             {[5, 10, 20, 50, 100,"all"].map((size) => (
//               <option key={size} value={size}>
//                 {size}
//               </option>
//             ))}
//           </select>
//         </div>
//       )}

//       {/* 🔹 أزرار الصفحات */}
//       <div className="flex items-center gap-2">
//         {/* زر السابق */}
//         <button
//           onClick={() => onPageChange(Math.max(1, page - 1))}
//           disabled={page === 1}
//           className={`px-3 py-1 rounded-lg border text-sm font-medium transition 
//             ${
//               page === 1
//                 ? "bg-gray-100 text-gray-400 cursor-not-allowed"
//                 : "bg-white text-gray-700 hover:bg-gray-100 border-gray-300"
//             }`}
//         >
//           Prev
//         </button>

//         {/* أرقام الصفحات */}
//         {getPages().map((p, idx) =>
//           p === "..." ? (
//             <span key={idx} className="px-2 text-gray-500">
//               ...
//             </span>
//           ) : (
//             <button
//               key={p}
//               onClick={() => onPageChange(Number(p))}
//               className={`px-3 py-1 rounded-lg border text-sm font-medium transition 
//                 ${
//                   p === page
//                     ? "bg-blue-600 text-white border-blue-600"
//                     : "bg-white text-gray-700 hover:bg-gray-100 border-gray-300"
//                 }`}
//             >
//               {p}
//             </button>
//           )
//         )}

//         {/* زر التالي */}
//         <button
//           onClick={() => onPageChange(Math.min(totalPages, page + 1))}
//           disabled={page === totalPages}
//           className={`px-3 py-1 rounded-lg border text-sm font-medium transition 
//             ${
//               page === totalPages
//                 ? "bg-gray-100 text-gray-400 cursor-not-allowed"
//                 : "bg-white text-gray-700 hover:bg-gray-100 border-gray-300"
//             }`}
//         >
//           Next
//         </button>
//       </div>
//     </div>
//   );
// }



// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
// import { useState } from "react";

// interface PaginationProps {
//   page: number;
//   totalPages: number;
//   onPageChange: (page: number) => void;
//   pageSize: number;
//   onPageSizeChange: (size: number | "all") => void;
// }

// export function Pagination({
//   page,
//   totalPages,
//   onPageChange,
//   pageSize,
//   onPageSizeChange,
// }: PaginationProps) {
//   const [open, setOpen] = useState(false);

//   const getPages = () => {
//     const pages: (number | string)[] = [];
//     if (totalPages <= 7) {
//       for (let i = 1; i <= totalPages; i++) pages.push(i);
//     } else {
//       pages.push(1);
//       if (page > 3) pages.push("...");
//       for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
//         pages.push(i);
//       }
//       if (page < totalPages - 2) pages.push("...");
//       pages.push(totalPages);
//     }
//     return pages;
//   };
//   const handleAllChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     onPageSizeChange(e.target.checked ? "all" : pageSize);
//   };

//   return (
//     <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-6">

//       {/* ✅ الجزء الخاص بالتحكم في عدد النتائج */}
//       <div className="flex items-center gap-2">
//         <span className="text-sm text-gray-600">Items per page:</span>
//         <select
//           value={pageSize}
//           onChange={(e) => {
//             const value = e.target.value === "all" ? "all" : Number(e.target.value);
//             onPageSizeChange(value);
//           }}
//           className="border border-gray-300 rounded-md px-2 py-1 text-sm"
//         >
//           <option value={10}>10</option>
//           <option value={25}>25</option>
//           <option value={50}>50</option>
//           <option value="all">All</option> {/* 👈 هنا نضيف عرض الكل */}
//         </select>
//       </div>
//       <div className="flex items-center gap-2">
//         All 
//         <input type="checkbox" checked={pageSize === "all"} onChange={handleAllChange} />
//       </div>

//       {/* ✅ أزرار التنقل بين الصفحات */}
//       <div className="flex items-center justify-center gap-2">
//         <button
//           onClick={() => onPageChange(Math.max(1, page - 1))}
//           disabled={page === 1}
//           className={`px-3 py-1 rounded-lg border text-sm font-medium transition 
//             ${page === 1
//               ? "bg-gray-100 text-gray-400 cursor-not-allowed"
//               : "bg-white text-gray-700 hover:bg-gray-100 border-gray-300"
//             }`}
//         >
//           Prev
//         </button>

//         {getPages().map((p, idx) =>
//           p === "..." ? (
//             <span key={idx} className="px-2 text-gray-500">...</span>
//           ) : (
//             <button
//               key={p}
//               onClick={() => onPageChange(Number(p))}
//               className={`px-3 py-1 rounded-lg border text-sm font-medium transition 
//                 ${p === page
//                   ? "bg-blue-600 text-white border-blue-600"
//                   : "bg-white text-gray-700 hover:bg-gray-100 border-gray-300"
//                 }`}
//             >
//               {p}
//             </button>
//           )
//         )}

//         <button
//           onClick={() => onPageChange(Math.min(totalPages, page + 1))}
//           disabled={page === totalPages}
//           className={`px-3 py-1 rounded-lg border text-sm font-medium transition 
//             ${page === totalPages
//               ? "bg-gray-100 text-gray-400 cursor-not-allowed"
//               : "bg-white text-gray-700 hover:bg-gray-100 border-gray-300"
//             }`}
//         >
//           Next
//         </button>
//       </div>
//     </div>
//   );
// }


import React from "react";

interface PaginationProps {
  page: number;
  totalPages: number;
  pageSize: number | "all";
  all: boolean;
  onPageChange: (page: number) => void;
  onPageSizeChange: (value: number | "all") => void;
  onToggleAll: (checked: boolean) => void; // ✅ جديد
}

export function Pagination({
  page,
  totalPages,
  pageSize,
  all,
  onPageChange,
  onPageSizeChange,
  onToggleAll,
}: PaginationProps) {
  const getPages = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (page > 3) pages.push("...");
      for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++)
        pages.push(i);
      if (page < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className="flex flex-col md:flex-row items-center justify-center gap-3 mt-6">
      {/* ✅ Checkbox لعرض الكل */}
      <label className="flex items-center gap-2 text-sm font-medium">
        <input
          type="checkbox"
          checked={all}
          onChange={(e) => onToggleAll(e.target.checked)}
        />
        عرض الكل
      </label>

      {/* ✅ Dropdown لتغيير حجم الصفحة */}
      <select
        value={String(pageSize)}
        onChange={(e) =>
          onPageSizeChange(e.target.value === "all" ? "all" : Number(e.target.value))
        }
        disabled={all} // ❌ تعطيل عند تفعيل "عرض الكل"
        className="border border-gray-300 rounded-md px-2 py-1 text-sm"
      >
        <option value="10">10</option>
        <option value="25">25</option>
        <option value="50">50</option>
        <option value="100">100</option>
      </select>

      {/* ✅ Pagination Buttons */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page === 1 || all}
          className={`px-3 py-1 rounded-lg border text-sm font-medium transition 
            ${page === 1 || all
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-white text-gray-700 hover:bg-gray-100 border-gray-300"
            }`}
        >
          Prev
        </button>

        {getPages().map((p, idx) =>
          p === "..." ? (
            <span key={idx} className="px-2 text-gray-500">
              ...
            </span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(Number(p))}
              disabled={all}
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

        <button
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          disabled={page === totalPages || all}
          className={`px-3 py-1 rounded-lg border text-sm font-medium transition 
            ${page === totalPages || all
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-white text-gray-700 hover:bg-gray-100 border-gray-300"
            }`}
        >
          Next
        </button>
      </div>
    </div>
  );
}

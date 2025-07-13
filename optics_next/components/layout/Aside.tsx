'use client';
import { X } from 'lucide-react';
import { useAside } from '@/lib/context/AsideContext';
import React from 'react';

export default function Aside() {
  const { toggleAside, isVisible } = useAside();

  return (
    <aside
      className={`fixed top-0 left-0 h-full w-72 bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 shadow-md z-40 
        transform transition-transform duration-300
        ${isVisible ? 'translate-x-0' : 'translate-x-full'}
      `}
    >
      {/* زر الإغلاق */}
      <button
        onClick={toggleAside}
        className="absolute top-3 right-3 text-gray-500 hover:text-red-500"
        aria-label="Close Sidebar"
      >
        <X size={20} />
      </button>

      {/* المحتوى */}
      <div className="mt-12 px-4">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
          Sidebar
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          This is the default sidebar content. You can override it from any page.
        </p>
      </div>
    </aside>
  );
}

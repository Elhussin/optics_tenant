'use client';
import { useAside } from '@/lib/context/AsideContext';
import { X, Menu } from 'lucide-react';

export const AsideButton = () => {
  const { isVisible, toggleAside } = useAside();

  return (
    <button
      onClick={toggleAside}
      className="fixed bottom-16 left-4 z-50 p-2 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:shadow-xl 
      transition-all duration-200"
      aria-label="Toggle Sidebar"
    >
        
      {isVisible ? <X size={22} className="text-gray-700 dark:text-white  " /> : <Menu size={22} className="text-gray-700 dark:text-white" />}
    </button>
  );
};

'use client';
import { useAside } from '@/lib/context/AsideContext';
import { Menu ,X} from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export const AsideButton = () => {
  const { isVisible, toggleAside } = useAside();

  return (
    <button
      onClick={toggleAside}
      aria-label="Toggle Sidebar"
      className= {cn("aside-button")} 
    >
      {!isVisible &&
          <Menu size={22} className="text-gray-700 dark:text-white" />}
    </button>
  );
};

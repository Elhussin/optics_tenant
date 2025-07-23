'use client';
import { useAside } from '@/lib/context/AsideContext';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

export const AsideButton = () => {
  const { isVisible, toggleAside } = useAside();

  return (
    <motion.button
      onClick={toggleAside}
      aria-label="Toggle Sidebar"
      initial={false}
      animate={{
        x: isVisible ? 288 : 0, // 288px = 72 * 4 (w-72 أو w-80 حسب عرض الـ Aside)
      }}
      transition={{ duration: 0.7, ease: "easeInOut" }}
      className="aside-button fixed top-4 z-50" // تأكد من وضع button فوق الـ aside دائمًا
    >
      {isVisible ? (
        <ArrowLeft size={22} className="text-gray-700 dark:text-white" />
      ) : (
        <ArrowRight size={22} className="text-gray-700 dark:text-white" />
      )}
    </motion.button>
  );
};

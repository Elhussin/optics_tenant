'use client';
import { useAside } from '@/src/shared/contexts/AsideContext';
import React from 'react';
import { Link } from '@/src/app/i18n/navigation';
import { motion } from "framer-motion";
import { useUser } from '@/src/features/auth/hooks/UserContext';
import { X } from 'lucide-react';
import { URLDATA, navUrl } from '@/src/shared/constants/url';
import Image from 'next/image';
import { useTranslations ,useLocale} from 'next-intl';


export default function Aside() {
  const locale = useLocale(); // يرجع 'ar' أو 'en' مثلاً
  const isRTL = locale === 'ar';

  const { isVisible, asideContent, toggleAside } = useAside();

  const asideBase = `
  fixed top-0 ${isRTL ? 'right-0' : 'left-0'}
  h-screen w-80 bg-surface border-r border-gray-200 dark:border-gray-700
  shadow-md z-40 transform transition-transform duration-700 ease-in-out
`;


  return (
    <motion.aside
      initial={{ x: isRTL ? '100%' : '-100%' }}
      animate={{ x: isVisible ? '0%' : isRTL ? '100%' : '-100%' }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
      className={asideBase}
    >
      <div className="pt-16 px-6 pb-6 h-full overflow-y-auto scrollbar-thin">
        {asideContent ? asideContent : <AsidDeafualtContent />}
      </div>

      <button
        onClick={toggleAside}
        className={`absolute top-4 ${isRTL ? 'right-70' : 'left-70'} text-danger hover:text-red-600 transition-colors duration-200`}
      >
        <X size={24} />
      </button>
    </motion.aside>

  );
}


const AsidDeafualtContent = () => {
  const t = useTranslations('aside');
  const { user } = useUser();

  return (
    <nav className="flex flex-col gap-3 text-gray-700 dark:text-gray-300">
      {user ? (
        URLDATA.map((item) => (
          <Link key={item.path} href={item.path} className="nav-link">{t(item.name)}</Link>
        ))

      ) : (
        <div className="flex flex-col gap-3">
          {navUrl.map((item) => (
            <Link key={item.path} href={item.path} className="nav-link">{t(item.name)}</Link>
          ))}
          <Image src="/media/aside.png" alt="logo" width={300} height={100} priority={true} />
        </div>
      )}

    </nav>
  );
}



'use client';
import { useAside } from '@/lib/context/AsideContext';
import React from 'react';
import { Link } from '@/app/i18n/navigation';
import { motion } from "framer-motion";
import { useUser } from '@/lib/context/userContext';
import { X } from 'lucide-react';
import { URLDATA,navUrl  } from '@/config/URLDATA';
import Image from 'next/image';
import { useTranslations } from 'next-intl';

export default function Aside() {


  const { isVisible, asideContent,toggleAside } = useAside();

  const asideBase = "fixed top-0 left-0 h-screen bg-surface  w-80 border-r border-gray-200 dark:border-gray-700 shadow-md z-40 transform transition-transform duration-700 ease-in-out";


  return (
    <motion.aside
      initial={{ x: "-100%" }}
      animate={{ x: isVisible ? "0%" : "-100%" }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
      className={asideBase}
    >

      <div className="pt-16 px-6 pb-6 h-full overflow-y-auto scrollbar-thin">
        {asideContent ? asideContent : <AsidDeafualtContent />}

      </div>
      <button onClick={toggleAside} className="fixed top-1 left-70   text-danger hover:text-red-600 transition-colors duration-200">
        <X size={24} />
      </button>
    </motion.aside>
  );
}


const AsidDeafualtContent = () => {
 const t = useTranslations('aside');
const t2 = useTranslations('asideActive');
  const { user } = useUser();

  return (
    <nav className="flex flex-col gap-3 text-gray-700 dark:text-gray-300">
      {user ? (
        URLDATA.map((item) => (
          <Link key={item.path} href={item.path} className="nav-link">{t2(item.name)}</Link>
        ))

      ) : (
        <div className="flex flex-col gap-3">
          {navUrl.map((item) => (
            <Link key={item.path} href={item.path} className="nav-link">{t(item.name)}</Link>
          ))}
        <Image src="/media/aside.png" alt="logo" width={300} height={100}  priority={true}/>
        </div>
      )}

    </nav>
  );
}



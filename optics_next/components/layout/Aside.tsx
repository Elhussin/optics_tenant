'use client';
import { useAside } from '@/lib/context/AsideContext';
import React from 'react';

import {Link} from '@/app/i18n/navigation';
import { motion } from "framer-motion";
//  className="w-full md:w-80"
export default function Aside() {
  const { isVisible,asideContent } = useAside();
  const asideBase = "fixed top-0 left-0 h-screen bg-surface  w-80 border-r border-gray-200 dark:border-gray-700 shadow-md z-40 transform transition-transform duration-700 ease-in-out";

  return (
    <motion.aside
  initial={{ x: "-100%" }}
  animate={{ x: isVisible ? "0%" : "-100%" }}
  transition={{ duration: 0.7, ease: "easeInOut" }}
  className={asideBase}
>

      <div className="pt-16 px-6 pb-6 h-full overflow-y-auto scrollbar-thin">
      {asideContent ? asideContent : <AsidDeafualtContent />}

      </div>
    </motion.aside>
  );
}


const AsidDeafualtContent = () => {

  return (
        <nav className="flex flex-col gap-3 text-gray-700 dark:text-gray-300">
          <Link className="nav-link " href="/">Home</Link>
          <Link className="nav-link " href="/auth/login">Login</Link>
          <Link className="nav-link " href="/auth/register">Register</Link>
          <Link className="nav-link " href="/profile">Profile</Link>
          <Link className="nav-link " href="/admin">Admin</Link>
          <Link className="nav-link " href="/prescriptions">Prescriptions</Link>
          <Link className="nav-link " href="/about">About</Link>
          <Link className="nav-link " href="/contact">Contact</Link>
          <Link className="nav-link " href="/users">Users</Link>
          <Link className="nav-link " href="/tenants">Tenants</Link>
          <Link className="nav-link " href="/groups">Groups</Link>
          <Link className="nav-link " href="/crm">CRM</Link>
          <Link className="nav-link " href="/permissions">Permissions</Link>
        </nav>
  );
}

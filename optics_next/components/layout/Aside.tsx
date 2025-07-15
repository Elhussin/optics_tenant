'use client';
import { X } from 'lucide-react';
import { useAside } from '@/lib/context/AsideContext';
import React from 'react';
import Link from 'next/link';

export default function Aside() {
  const { toggleAside, isVisible } = useAside();

  return (
    <aside
    
      className={`fixed top-16 left-0 h-full w-96 bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 shadow-md z-40 
        transform transition-transform duration-300
        ${isVisible ? 'translate-x-0' : 'translate-x-full'}
      `}

    >
      {/* زر الإغلاق */}
      <button
        onClick={toggleAside}
        className="absolute top-16 right-3 text-gray-500 hover:text-red-500"
        aria-label="Close Sidebar"
      >
        <X size={20} />
      </button>

      {/* المحتوى */}
      <div className="mt-32 px-4 w-4/5">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
          Sidebar
        </h2>
        <div className="flex flex-col gap-2">
        <Link href="/">Home</Link>
          <Link href="/auth/login">Login</Link>
          <Link href="/auth/register">Register</Link>
          <Link href="/profile">Profile</Link>
          <Link href="/admin">Admin</Link>
          <Link href="/prescriptions">Prescriptions</Link>
          <Link href="/about">About</Link>
          <Link href="/contact">Contact</Link>
          <Link href="/users">Users</Link>
          <Link href="/tenants">Tenants</Link>
          <Link href="/groups">Groups</Link>
          <Link href="/crm">CRM</Link>
          <Link href="/permissions">Permissions</Link>
        </div>
      </div>
    </aside>
  );
}

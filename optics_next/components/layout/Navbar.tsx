'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useUser } from '@/lib/context/userContext';
import { AsideButton } from "@/components/ui/buttons/AsideButton";
import LogoutButton from '../ui/buttons/logout';
import ThemeToggle from '../ui/ThemeToggle';
import { Menu, X } from 'lucide-react';
import { getSubdomain } from '@/lib/utils/getSubdomain';
export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const userContext = useUser();

  const subdomain = getSubdomain();
  if (!userContext) return <div>Loading...</div>;
  const { user, logout } = userContext;

  return (
    <nav className="w-full bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center justify-between relative z-50">
      {/* Logo + Aside Button */}
      <div className="flex items-center gap-4">
        <AsideButton />
        <Link href="/" className="font-bold text-xl text-gray-800 dark:text-white">O S M</Link>
      </div>

      {/* Desktop Links */}
      <div className="hidden md:flex gap-4 items-center">
        <Link href="/" className="nav-link">Home</Link>

        {user ? (
          <>
            {user.role === 'ADMIN' && <Link href="/admin" className="nav-link">Admin Panel</Link>}
            {user.role === 'TECHNICIAN' && <Link href="/prescriptions" className="nav-link">Prescriptions</Link>}
            <Link href="/profile" className="nav-link">Profile</Link>
            <LogoutButton logout={logout} />
            <ThemeToggle />
          </>
        ) : (
          <>
          {subdomain ? (
            <>
            <Link href="/auth/login" className="nav-link">Login</Link>
            <Link href="/auth/register" className="nav-link">Register</Link>
            </>
          ) : (
            <>
        
            <Link href="/auth/register" className="nav-link">Register</Link>
            </>
          )}
            <ThemeToggle />
          </>
        )}
      </div>

      {/* Mobile Menu Toggle Button */}
      <div className="md:hidden">
        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-700 dark:text-white">
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      {isMenuOpen && (
        <div className="absolute top-full left-0 w-full bg-white dark:bg-gray-900 shadow-md flex flex-col gap-4 p-4 md:hidden z-50">

          <Link href="/" onClick={() => setIsMenuOpen(false)} className="nav-link">Home</Link>
          {user ? (
            <>
              {user.role === 'ADMIN' && <Link href="/admin" onClick={() => setIsMenuOpen(false)} className="nav-link">Admin Panel</Link>}
              {user.role === 'TECHNICIAN' && <Link href="/prescriptions" onClick={() => setIsMenuOpen(false)} className="nav-link">Prescriptions</Link>}
              <Link href="/profile" onClick={() => setIsMenuOpen(false)} className="nav-link">Profile</Link>

              <div className="flex items-center gap-2">
                <LogoutButton logout={() => { setIsMenuOpen(false); logout(); }} />
                <ThemeToggle />
              </div>
            </>
          ) : (
            <>
            {subdomain ? (
              <>
              <Link href="/auth/login" onClick={() => setIsMenuOpen(false)} className="nav-link">Login</Link>
              <Link href="/auth/register" onClick={() => setIsMenuOpen(false)} className="nav-link">Register</Link>
              </>
            ) : (
              <>
              <Link href="/auth/register" onClick={() => setIsMenuOpen(false)} className="nav-link">Register</Link>
              </>
            )}
              <div className="flex items-center gap-2">
                <ThemeToggle />
              </div>
            </>
          )}
        </div>
      )}
    </nav>
  );
}

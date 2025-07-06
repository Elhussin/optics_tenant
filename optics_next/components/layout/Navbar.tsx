
'use client';

import Link from 'next/link';
// import { useCurrentUser } from '@/src/lib/hooks/useCurrentUser';
import { useUser } from  '@/lib/hooks/useCurrentUser'

import LogoutButton from '../logout';
import ThemeToggle from '../ThemeToggle';

export default function Navbar() {
  const userContext = useUser();

  if (!userContext) return <div>Loading...</div>;

  const { user, loading, logout} = userContext;

  // if (loading) return <div>Loading...</div>; // أو spinner لو تحب

  return (
    <nav className="bg-white shadow px-4 py-3 flex justify-between items-center">
      <div>
        <Link href="/" className="font-bold text-lg">O S M</Link>
      </div>

      <div className="flex gap-4 items-center">
        <Link href="/">Home</Link>

        {user ? (
          <>
            {/* صلاحيات خاصة مثل ADMIN */}
            {user.role === 'ADMIN' && <Link href="/admin">Admin Panel</Link>}
            {user.role === 'TECHNICIAN' && <Link href="/prescriptions">Prescriptions</Link>}
            
            <Link href="/profile">Profile</Link>
            <LogoutButton logout={logout}/>
            <ThemeToggle />
     
          </>
        ) : (
          <>
            <Link href="/auth/login">Login</Link>
            <Link href="/auth/register">Register</Link>
            <ThemeToggle />
          </>
        )}
      </div>
    </nav>
  );
}

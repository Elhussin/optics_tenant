
'use client';

import Link from 'next/link';
import { useCurrentUser } from '@/src/hooks/useCurrentUser';
import LogoutButton from './logout';

export default function Navbar() {
  const { user, loading } = useCurrentUser();

  if (loading) return <div>Loading...</div>; // أو spinner لو تحب

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
            <LogoutButton />
            <form action="/api/users/logout" method="POST">

              <button className="text-red-600" type="submit">Logout</button>
            </form>
          </>
        ) : (
          <>
            <Link href="/auth/login">Login</Link>
            <Link href="/auth/register">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}


// app/auth/login/page.tsx
'use client';

import { useEffect } from 'react';
import { useUser } from '@/lib/hooks/useCurrentUser';
import { useRouter } from 'next/navigation';
import LoginRequestForm from '@/components/forms/LoginForm';

export default function LoginPage() {
  const { user, loading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.replace('/profile'); // إعادة توجيه المستخدم إذا كان مسجل دخول
    }
  }, [user, loading]);

  if (loading || user) {
    return <div className="p-4 text-center">Loading...</div>;
  }

  return (
    <div className="max-w-md mx-auto mt-10">
      <h1 className="text-2xl font-bold mb-6">Login</h1>
      <LoginRequestForm />
    </div>
  );
}


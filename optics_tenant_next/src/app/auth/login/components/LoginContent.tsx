'use client';

import LoginRequestForm from '@/src/components/forms/LoginRequestForm';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { useUser } from '@/src/lib/hooks/useCurrentUser';

export default function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userContext = useUser();

  if (!userContext) return <div>Loading...</div>;

  const { user, loading, refreshUser } = userContext;
  
  const redirectTo = searchParams.get('redirect') || 
      searchParams.get('callbackUrl') || 
      '/dashboard';

  if (loading) return <div>Loading...</div>;

  if (user) {
    toast.success('You are already logged in will redirect to ' + redirectTo);
    console.log(user);
    router.push(redirectTo);
    return null;
  }

  if (!refreshUser) {
    throw new Error('User context is not available');
  }

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-white rounded shadow">
      <h1 className="text-xl font-bold mb-6">Login</h1>
      <LoginRequestForm
        onSuccess={() => {
          toast.success('Login successfully');
          refreshUser();
          router.push(redirectTo);
        }}
      />
    </div>
  );
}

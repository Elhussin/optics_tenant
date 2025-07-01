'use client';

import LoginRequestForm from '@/components/forms/LoginRequestForm';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { generateMetadata } from '@/utils/metadata';
import { useUser } from '@/lib/hooks/useCurrentUser';
import { Suspense, useEffect } from 'react';

generateMetadata({
  title: 'Login | O-S-M',
  description: 'Login to your account',
  keywords: ['login', 'account', 'O-S-M'],
  canonicalUrl: 'https://solovizion.com/products/sunglasses-2025',
  openGraphImage: 'https://solovizion.com/images/products/sunglasses-og.jpg',
  openGraphType: 'login',
  twitterCardType: 'summary',
});


// Create a separate client component for the login logic
function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams(); // Now safely inside client context
  const userContext = useUser();

  const redirectTo = searchParams.get('redirect') || 
        searchParams.get('callbackUrl') || 
        '/profile';
        

    useEffect(() => {
      if (userContext) {
        const { user, loading } = userContext;
        
        if (user) {
          toast.success('You are already logged in will redirect to ' + redirectTo);
          router.push(redirectTo);
        }
      }
    }, [userContext, router, redirectTo]); // يتم تشغيله فقط عندما يتغير user

    if (userContext?.loading) return <div>Loading...</div>;
  



  return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-white rounded shadow">
      <h1 className="text-xl font-bold mb-6">Login</h1>
      <LoginRequestForm
        onSuccess={() => {
          toast.success('Login successfully');
          userContext?.refreshUser();
          router.push(redirectTo);
        }}
      />
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginContent />
    </Suspense>
  );
}
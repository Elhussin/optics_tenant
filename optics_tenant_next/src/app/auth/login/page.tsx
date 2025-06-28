
'use client';

import LoginRequestForm from '@/src/components/forms/LoginRequestForm';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { generateMetadata } from '@/src/lib/utils/metadata';
import { useUser } from  '@/src/lib/hooks/useCurrentUser'


 generateMetadata({
  title: 'Login | O-S-M',
  description: 'Login to your account',
  keywords: ['login', 'account', 'O-S-M'],
  canonicalUrl: 'https://solovizion.com/products/sunglasses-2025',
  openGraphImage: 'https://solovizion.com/images/products/sunglasses-og.jpg',
  openGraphType: 'login',
  twitterCardType: 'summary',
});

export default function LoginPage() {
  const router = useRouter();
  const { user, loading ,refreshUser} = useUser();
  
  if (loading) return <div>Loading...</div>;

  if (user) {
    return <div>You are already logged in</div>;
  }

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-white rounded shadow">
      <h1 className="text-xl font-bold mb-6">Login</h1>
      <LoginRequestForm
        onSuccess={() => {
          toast.success('Login successfully');
          refreshUser(); // يحدث NavBar تلقائيًا الآن
          router.push('/dashboard');
        }}

      />
    </div>
  );
}

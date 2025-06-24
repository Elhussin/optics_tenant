
'use client';

import LoginRequestForm from '@/src/components/forms/LoginRequestForm';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function LoginPage() {
  const router = useRouter();

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-white rounded shadow">
      <h1 className="text-xl font-bold mb-6">Login</h1>
      <LoginRequestForm
        onSuccess={() => {
          toast.success('Login successfully');
          router.push('/dashboard');
        }}
      />
    </div>
  );
}

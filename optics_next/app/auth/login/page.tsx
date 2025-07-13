'use client';
import { useEffect } from 'react';
import { useUser } from '@/lib/context/userContext';
import { useRouter } from 'next/navigation';
import LoginRequestForm from '@/components/forms/LoginForm';
import { Loading4 } from '@/components/ui/loding';
import { toast } from 'sonner';
export default function LoginPage() {
  const { user, loading } = useUser();
  const router = useRouter();

  // useEffect(() => {
  //   if (!loading && user) {
  //     router.replace('/profile'); 
  //   }
  // }, [user, loading]);

  if (loading || user) {
    return <Loading4 />;
  }

  return (
    <div className="card">
      <h1 className="card-header my-4">Login</h1>
      <LoginRequestForm 
      alias="users_login_create"
      onSuccess={() => {
        toast.success('Login successfully');
      }} />
    </div>
  );
}


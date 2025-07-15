'use client';
// import { useEffect } from 'react';
import { useUser } from '@/lib/context/userContext';
import LoginRequestForm from '@/components/forms/LoginForm';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Loading4 } from '@/components/ui/button/loding';
export default function LoginPage() {
  const { user } = useUser();
  const router = useRouter();

  if ( user) {
    router.replace('/profile');
    return <Loading4 />;
  }

  return (
    <div className="card">
      <h1 className="card-header my-4">Login</h1>
      <LoginRequestForm 
      alias="users_login_create"
      className="container"
      onSuccess={() => {
        toast.success('Login successfully');
      }} />
    </div>
  );
}


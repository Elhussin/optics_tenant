'use client';

import LoginRequestForm from '@/components/forms/LoginForm';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
export default function RegisterPage() {
  const router = useRouter();
  return (
    <div className="card">
      <h1 className="card-header my-4">Register</h1>
      <LoginRequestForm 
      alias="users_register_create"
      submitText="Register"
      mode="create"
      className="container"
      onSuccess={() => {
        toast.success('Register successfully');
      }} />
    </div>
  );
}


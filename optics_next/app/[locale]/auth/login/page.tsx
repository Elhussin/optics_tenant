'use client';
import LoginForm from '@/components/forms/LoginForm';
import { toast } from 'sonner';

export default function LoginPage() {
  return (
    <div className="card">
      <h1 className="card-header my-4">Login</h1>
      <LoginForm 
      alias="users_login_create"
      className="container"
      onSuccess={() => {
        toast.success('Login successfully');
      }} />
    </div>
  );
}


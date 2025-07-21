'use client';

import LoginForm from '@/components/forms/LoginForm';
import { toast } from 'sonner';
import { getSubdomain } from '@/lib/utils/getSubdomain';
export default function RegisterPage() {
  const subdomain = getSubdomain();
  let alias : string = "users_register_create";
  let message : string = "Register successfully";
  let istenant : boolean = false;

  if(!subdomain){
    alias = "tenants_register_create";
    message = "Account Created! activate your account";
    istenant = true;
  }
  

  return (
    <div className="card">
      <h1 className="card-header my-4">Register</h1>
      <LoginForm 
      istenant={istenant}
      alias={alias}
      submitText="Register"
      mode="create"
      className="container"
      onSuccess={() => {
        toast.success(message);
      }} />
    </div>
  );
}


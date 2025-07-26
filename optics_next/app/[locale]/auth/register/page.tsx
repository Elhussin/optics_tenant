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

      <LoginForm 
      istenant={istenant}
      alias={alias}
      submitText="Register"
      mode="create"
      title="Register"
      message={message}     
      />
  );
}


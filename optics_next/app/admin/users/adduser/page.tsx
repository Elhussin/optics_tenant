
'use client';

import UserRequestForm from '@/components/forms/CreateUserForm';
import { toast } from 'sonner';



export default function AddUserPage() {

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-white rounded shadow">
      <h1 className="text-xl font-bold mb-6">Login</h1>
      <UserRequestForm
        onSuccess={() => {
          toast.success('Create user successfully');
        }}
      />
    </div>
  );
}

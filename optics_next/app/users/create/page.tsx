'use client';

import CreateUserForm from '@/components/forms/UserForm';
import { useRouter } from 'next/navigation';  
import { toast } from 'sonner';

export default function CreateUserPage() {
  const router = useRouter();

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-white rounded shadow">
      <h1 className="text-xl font-bold mb-6">Add New User</h1>
      <CreateUserForm
        onSuccess={() => {
            toast.success('User created successfully')

        } }
        onCancel={() => {
            router.push('/users/create');
        }}
        className = ""
        submitText = "Create"
        showCancelButton = {true}
        alias="users_users_create"
        mode="create"
      />
    </div>
  );
}

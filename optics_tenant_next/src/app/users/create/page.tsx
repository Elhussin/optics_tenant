'use client';

import UserRequestForm from '@/src/components/forms/UserRequestForm';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function CreateUserPage() {
  const router = useRouter();

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-white rounded shadow">
      <h1 className="text-xl font-bold mb-6">Add New User</h1>
      <UserRequestForm
        onSuccess={() => {
          toast.success('تم إنشاء المستخدم بنجاح!');
          router.push('/users');
        }}
      />
    </div>
  );
}

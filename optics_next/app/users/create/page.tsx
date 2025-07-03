'use client';

import CreateUserForm from '@/components/forms/CreateUserForm';
import { useRouter } from 'next/navigation';  
import { toast } from 'sonner';
import { useUser } from '@/lib/hooks/useCurrentUser';

export default function CreateUserPage() {
  const router = useRouter();
  const userContext = useUser();

  // if (userContext?.user?.role !== 'ADMIN') {
  //   return <div>You are not allowed to view this page.</div>;
  // }

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-white rounded shadow">
      <h1 className="text-xl font-bold mb-6">Add New User</h1>
      <CreateUserForm
        onSuccess={() => {
          toast.success('تم إنشاء المستخدم بنجاح!');
          router.push('/users/create');
        }}
      />
    </div>
  );
}

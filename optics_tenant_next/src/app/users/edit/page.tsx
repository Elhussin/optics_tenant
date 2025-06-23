'use client';

import UserForm from '@/src/components/forms/UserRequestForm';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/src/api-zod/zodSchemas';
import { toast } from 'sonner';

export default function EditUserPage({ params }: { params: { id: string } }) {
  const [defaultValues, setDefaultValues] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    api.get(`/api/users/users/${params.id}/`).then(setDefaultValues);
  }, [params.id]);

  if (!defaultValues) return <p>جاري التحميل...</p>;

  return (
    <UserForm
      defaultValues={defaultValues}
      onSuccess={() => {
        toast.success('تم تحديث المستخدم!');
        router.push('/users');
      }}
    />
  );
}

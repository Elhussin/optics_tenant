'use client';
import CreateUserForm from '@/components/forms/CreateUserForm';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
// import { api } from '@/lib/zod-client/zodios-client';
import { toast } from 'sonner';
import { useFormRequest } from '@/lib/hooks/useFormRequest';
import { schemas } from '@/lib/zod-client';
const schema = schemas.UserRequest;

export default async function EditUserPage({ params }: { params: Promise<{ User: {} }> }) {
  const userId = await params;
  console.log(userId);
  const {
    register, handleSubmit,formState: { errors }, submitForm,setValue,isLoading
  } = useFormRequest(schema, {mode: 'get', id: userId, apiOptions: {
      endpoint: 'users/users', 
      onSuccess: (data) => {
        console.log('User data loaded:', data);
  
        if (data.success && data.data) {
          Object.entries(data.data).forEach(([key, value]) => {
            setValue(key as any, value);
          });
        }
      },
      onError: (error) => {
        console.error('Failed to load user:', error);
      }
    }
  });

  // جلب البيانات عند تحميل المكون
  useEffect(() => {
    const fetchData = async () => {
      await submitForm({} as any); // إرسال طلب GET (لا حاجة للبيانات في GET)
    };
    fetchData();
  }, [userId]);

  if (!defaultValues) return <p>Loading...</p>;

  return (
    <CreateUserForm
    mode="edit"
    id={defaultValues.id}
    defaultValues={{
      username: defaultValues.username,
      email: defaultValues.email,
      first_name: defaultValues.first_name,
      last_name: defaultValues.last_name,
      is_active: defaultValues.is_active,
      role: defaultValues.role
    }}
    onSuccess={() => {
      toast.success('User updated successfully');
      router.push('/users/edit/' + defaultValues.id);
    }}
    onCancel={() => {
      router.push('/users/edit/' + defaultValues.id);
    }}
  />
  );
}

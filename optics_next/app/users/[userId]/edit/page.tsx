'use client';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import CreateUserForm from '@/components/forms/UserForm';
import { api } from "@/lib/api/axios";
import { useFormRequest } from '@/lib/hooks/useFormRequest';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';

export default function UserDetail() {
  const params = useParams();
  const userId = params.userId; // or params['userId']

  const [defaultValues, setDefaultValues] = useState<any>(null);
  const router = useRouter();

    const fetchUser = useFormRequest({
        alias: "users_users_retrieve",
        onSuccess: (res) => {
            console.log('User loaded:', res);
            setDefaultValues(res);

        },
        onError: (err) => {
            console.error('Error loading user:', err);
        }
    });

    useEffect(() => {
        if (userId) {
            fetchUser.submitForm({ id: userId });
        }
    }, [userId]); // ✅ استدعاء مرة واحدة فقط عند تغير userId

  
  if (!defaultValues) return <p>Loading...</p>;

  return (
    <div>
      <h1>Edit User</h1>
      <CreateUserForm 
      onSuccess={() => toast.success("User updated successfully",)} 
      onCancel={() => router.back()} 
      className = ""
      submitText = "Update"
      alias="users_users_partial_update"
      mode="edit"
      defaultValues={defaultValues} 
      />
    </div>
  );
}
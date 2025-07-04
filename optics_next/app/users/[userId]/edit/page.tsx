'use client';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import CreateUserForm from '@/components/forms/CreateUserForm';
import { ApiClient } from "@/lib/zod-client/api-client";

type Props = {
  params: {
    userId: string;
  };
};

export default async function EditUserPage({ params }: Props) {
  const { userId } = await params;
  const [defaultValues, setDefaultValues] = useState<any>(null);


  useEffect(() => {
    async function fetchUser() {
      try {
        const data = await ApiClient.get("users_users_retrieve", { id: userId });
        setDefaultValues(data);
      } catch (err) {
        // تم التعامل مع الخطأ تلقائيًا في handleApiError
      }
    }
  
    fetchUser();
  }, [userId]);
  
  
  if (!defaultValues) return <p>Loading...</p>;

  return (
    <div>
      <h1>Edit User</h1>
      <CreateUserForm onSuccess={() => toast.success("User updated successfully")} onCancel={() => router.back()} mode="edit" id={defaultValues.id} apiOptions={{ endpoint: "users_users_update", onSuccess: (res) => toast.success("User updated successfully"), defaultValues: defaultValues }} />
    </div>
  );
}
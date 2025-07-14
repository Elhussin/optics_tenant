'use client';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import CreateUserForm from '@/components/forms/UserForm';
import { useParams } from 'next/navigation';
import { Loading4 } from '@/components/ui/loding';
import { createFetcher } from '@/lib/hooks/useCrudFormRequest';
import { BackButton } from '@/components/ui/ActionButtons';

export default function UserDetailPage() {
  const params = useParams();
  const userId = params.userId; // or params['userId']
  const [defaultValues, setDefaultValues] = useState<any>(null);

  const fetchUser = createFetcher("users_users_retrieve", setDefaultValues);

  useEffect(() => {
    if (userId) {
      fetchUser({ id: userId });
    }
  }, [userId]);

  if (!defaultValues) return <Loading4 />;

  return (
    <div>
      <div className="main-header">
        <h2 className="title-1">Edit User</h2>
        <BackButton />
      </div>
      <CreateUserForm
        onSuccess={() => toast.success("User updated successfully",)}
        submitText="Update User"
        alias="users_users_partial_update"
        mode="edit"
        defaultValues={defaultValues}
        showCancelButton={true}
      />
    </div>
  );
}
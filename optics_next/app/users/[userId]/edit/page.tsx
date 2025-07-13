'use client';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import CreateUserForm from '@/components/forms/UserForm';
import { useFormRequest } from '@/lib/hooks/useFormRequest';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import { Loading4 } from '@/components/ui/loding';

export default function UserDetailPage() {
  const params = useParams();
  const userId = params.userId; // or params['userId']
  const [defaultValues, setDefaultValues] = useState<any>(null);
  const { form, onSubmit } = useCrudFormRequest(...);

    // const fetchUser = useFormRequest({
    //     alias: "users_users_retrieve",
    //     onSuccess: (res) => {
    //         console.log('User loaded:', res);
    //         setDefaultValues(res);

    //     },
    //     onError: (err) => {
    //         console.error('Error loading user:', err);
    //     }
    // });

    // useEffect(() => {
    //     if (userId) {
    //         fetchUser.submitForm({ id: userId });
    //     }
    // }, [userId]); 
    const fetchUser = createFetcher("users_users_retrieve", setDefaultValues);

    useEffect(() => {
      if (userId) {
        fetchUser({ id: userId });
      }
    }, [userId]);
  
  if (!defaultValues) return <Loading4 />;

  return (
    <div>
      <h1>Edit User</h1>
      <CreateUserForm 
      onSuccess={() => toast.success("User updated successfully",)} 
      submitText = "Update User"
      alias="users_users_partial_update"
      mode="edit"
      defaultValues={defaultValues} 
      showCancelButton={true}
      />
    </div>
  );
}
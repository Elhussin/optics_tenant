// ✅ app/users/UsersListClient.tsx
'use client';

import { useFilteredListRequest } from '@/lib/hooks/useFilteredListRequest';
import { SearchFilterForm } from '@/components/Search/SearchFilterForm';
import { generateSearchFieldsFromEndpoint } from '@/lib/utils/generateSearchFieldsFromEndpoint';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useFormRequest } from '@/lib/hooks/useFormRequest';
import { toast } from 'sonner';
import ActionButtons from '@/components/ui/ActionButtons';
import Button from '@/components/ui/Button';
import { Plus } from 'lucide-react';

export default function UsersListClient() {
  const fields = generateSearchFieldsFromEndpoint('users_users_list');
  const users = useFilteredListRequest('users_users_list');


  const router = useRouter();

    const deleteUser = useFormRequest({ alias: "users_users_destroy", onSuccess: (res) => { toast.success("User deleted successfully"); users.submitForm(); }, onError: (err) => { console.log(err); } });
    const handleDelete = (id: string|number) => {
      deleteUser.submitForm({ id });
      users
    };

    useEffect(() => {
      users
    }, []);
  
  
    // 🔹 تحديث مستخدم
    const handleUpdate = (id: string) => {
      router.push(`/users/${id}/edit`);
    };

    const handleCreate = () => {
      router.push('/users/create');
    };
    const handleView = (id: string) => {
      router.push(`/users/${id}/view`);
    };


    return (
    <div className="space-y-4 md:p-4">
       <SearchFilterForm fields={fields} />
      <div className="flex flex-wrap justify-between items-center">
        <h2 className="text-xl font-bold capitalize">Users</h2>
        <Button
          label="Create"
          onClick={() => handleCreate()}
          variant="primary"
          icon={<Plus size={16} />}
          className="md:mt-0 mt-4"
        />
      </div>

      <div className="card-continear">
        {users.data.map((user) => (
          <div key={user.id} className="cards">
            <h3 className="card-header">{user.username}</h3>
            <p className="card-body">{user.email}</p>
            <p className="card-body">{user.role}</p>
            <div className="btn-card">
              <ActionButtons
                onView={() => handleView(user.id)}
                onEdit={() => handleUpdate(user.id)}
                onDelete={() => handleDelete(user.id)}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

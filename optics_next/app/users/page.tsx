'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useFormRequest } from '@/lib/hooks/useFormRequest';
import { toast } from 'sonner';
import ActionButtons from '@/components/ui/ActionButtons';
import Button from '@/components/ui/Button';
export default function UserList() {

  const [users, setUsers] = useState<any[]>([]);
  const router = useRouter();


  
    const fetchUsers = useFormRequest({ alias: "users_users_list", onSuccess: (res) => { setUsers(res); }, onError: (err) => { console.log(err); } });
    const deleteUser = useFormRequest({ alias: "users_users_destroy", onSuccess: (res) => { toast.success("User deleted successfully"); fetchUsers.submitForm(); }, onError: (err) => { console.log(err); } });
    const handleDelete = (id: string|number) => {
      deleteUser.submitForm({ id });
      fetchUsers.submitForm();
    };

    useEffect(() => {
      fetchUsers.submitForm();
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
      <div className="flex flex-wrap justify-between items-center">
        <h2 className="text-xl font-bold">Users</h2>
        <Button
          label="Create User"
          onClick={() => handleCreate()}
          variant="primary"
          className="md:mt-0 mt-4"
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {users.map((user) => (
          <div key={user.id} className="bg-white shadow-md p-4 rounded-md">
            <h3 className="text-lg font-bold">{user.username}</h3>
            <p className="text-sm text-gray-600">{user.email}</p>
            <p className="text-sm text-gray-600">{user.role}</p>
            <div className="flex space-x-2 text-sm mt-4">
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

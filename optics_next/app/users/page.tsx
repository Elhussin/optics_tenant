'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useFormRequest } from '@/lib/hooks/useFormRequest';
import { toast } from 'sonner';
import ActionButtons from '@/components/ui/ActionButtons';
import Button from '@/components/ui/Button';
import { Plus } from 'lucide-react';
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
        {users.map((user) => (
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

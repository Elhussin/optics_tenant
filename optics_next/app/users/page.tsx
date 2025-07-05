'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useFormRequest } from '@/lib/hooks/useFormRequest';
import { toast } from 'sonner';

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
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Users</h2>
      <button onClick={handleCreate} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium transition-colors">Create User</button>
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2">Username</th>
            <th className="p-2">Email</th>
            <th className="p-2">Role</th>
            <th className="p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} className="border-t">
              <td className="p-2">{user.username}</td>
              <td className="p-2">{user.email}</td>
              <td className="p-2">{user.role}</td>
              <td className="p-2 space-x-2">
                <button onClick={() => handleUpdate(user.id)} className="text-blue-600 cursor-pointer">Edit</button>
                <button onClick={() => handleDelete(user.id)} className="text-red-600 cursor-pointer">Delete</button>
                <button onClick={() => handleView(user.id)} className="text-green-600 cursor-pointer">View</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

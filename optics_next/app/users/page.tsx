'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/zod-client/zodios-client';
import CreateUserForm from '@/components/forms/CreateUserForm';
import { useRouter } from 'next/navigation';
import EditUserPage from './[userId]/edit/page';
export default function UserList() {
  const [users, setUsers] = useState<any[]>([]);
  const [editUser, setEditUser] = useState<any | null>(null);
  const router = useRouter();

  const load = async () => {
    const data = await api.get('/api/users/users/');
    setUsers(data);
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (id: string) => {
    console.log(id);
    await api.delete(`/api/users/${id}/`, {});
    load();
  };

  const handleUpdate = async (id: string) => {
    console.log(id);
    router.push(`/users/${id}/edit`);

  };



  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Users</h2>
      {/* <CreateUserForm onSuccess={load} mode="create" id={editUser?.id} apiOptions={{ endpoint: 'users/register', onSuccess: (res) => load(), defaultValues: editUser }} /> */}
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
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

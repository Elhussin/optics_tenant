'use client';
import { useEffect, useState } from 'react';
import { api } from '@/src/api-zod/gin-api';
import UserForm from '@/src/components/form/UserForm';

export default function UserList() {
  const [users, setUsers] = useState<any[]>([]);
  const [editUser, setEditUser] = useState<any | null>(null);

  const load = async () => {
    const data = await api.get('/api/users/users/');
    setUsers(data);
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (id: string) => {
    await api.delete('/api/users/users/{id}/', { params: { id } });
    load();
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Users</h2>
      <UserForm onSuccess={load} defaultValues={editUser || undefined} />
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
                <button onClick={() => setEditUser(user)} className="text-blue-600">Edit</button>
                <button onClick={() => handleDelete(user.id)} className="text-red-600">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

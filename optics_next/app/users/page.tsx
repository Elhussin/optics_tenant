'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useFormRequest } from '@/lib/hooks/useFormRequest';


export default function UserList() {
    const [users, setUsers] = useState<any[]>([]);
    const router = useRouter();
  
    // 🔹 طلب جلب المستخدمين (GET)
    const { submitForm: fetchUsers, isLoading } = useFormRequest(undefined, {
      alias: "users_users_list",
      method: "GET",
      onSuccess: (res) => {
        console.log("Users fetched:", res);
        setUsers(res);
      },
    });
  
    // 🔹 طلب حذف مستخدم (DELETE)
    const { submitForm: deleteUser } = useFormRequest(undefined, {
      alias: "users_users_destroy", // تأكد من أنه هو alias الصحيح لـ DELETE user
      method: "DELETE",
      onSuccess: (res) => {
        console.log("User deleted:", res);
        fetchUsers(); // إعادة تحميل المستخدمين بعد الحذف
      },
    });
  
    // 🔹 تحميل المستخدمين عند الدخول
    useEffect(() => {
      fetchUsers();
    }, []);
  
    // 🔹 حذف مستخدم
    const handleDelete = async (id: string) => {
      console.log(id);
      await deleteUser({ id }); // تأكد أن alias يستخدم :id في المسار
    };
  
    // 🔹 تحديث مستخدم
    const handleUpdate = (id: string) => {
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

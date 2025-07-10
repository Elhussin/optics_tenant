'use client';

import CreateUserForm from '@/components/forms/UserForm';
export default function CreateUserPage() {

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-white rounded shadow">
      <h1 className="text-xl font-bold mb-6">Add New User</h1>
      <CreateUserForm
        submitText = "Add User"
        showCancelButton = {true}
        alias="users_users_create"
        mode="create"
      />
    </div>
  );
}

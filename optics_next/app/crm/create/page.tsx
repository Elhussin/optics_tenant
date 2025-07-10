'use client';
import { DynamicForm } from '@/components/forms/DynamicForm';
import { useCrudFormRequest } from '@/lib/hooks/useCrudFormRequest';

export default function CreateUserPage() {
  const { form, onSubmit } = useCrudFormRequest({
    alias: 'users_users_create',
    defaultValues: {},
    onSuccess: (res) => {
      console.log("Created:", res);
    },
  });

  return (
    <div className="max-w-xl mx-auto mt-10">
      <h1 className="text-2xl font-bold mb-6">Create User</h1>
      <DynamicForm
        schemaName="users"
        form={form}
        onSubmit={onSubmit}
        submitText="Create User"
      />
    </div>
  );
}

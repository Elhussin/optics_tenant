'use client';
import { toast } from 'sonner';
import DynamicFormGenerator from '@/components/generate/DynamicFormGenerator';
import { BackButton } from '@/components/ui/button/ActionButtons';

export default function CreateUserPage() {

  return (
    <>
      <div className="main-header">
        <h2 className="title-1">Add User</h2>
        <BackButton />
      </div>
      <DynamicFormGenerator
        schemaName="UserRequest"
        alias="users_users_create"
        onSuccess={() => toast.success('User created successfully')}
        onSubmit={(data) => console.log(data)}
        submitText="Add User"
      />
    </>

  );
}
'use client';
import { toast } from 'sonner';
import DynamicFormGenerator from '@/components/generate/DynamicFormGenerator';
import { BackButton } from '@/components/ui/buttons/ActionButtons';

export default function CreateUserPage() {

  return (
    <>
      <div className="main-header">
        <h2 className="title-1">Add User</h2>
        {/* <BackButton /> */}
      </div>
      <DynamicFormGenerator
        schemaName="UserRequest"
        alias="users_users_create"
        onSuccess={() => toast.success('User created successfully')}
        submitText="Add User"
      />
    </>

  );
}
'use client';

import CreateUserForm from '@/components/forms/UserForm';
import { toast } from 'sonner';
import DynamicFormGenerator from '@/components/generate/DynamicFormGenerator';
import Button from '@/components/ui/button/Button';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
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
        // className="w-full"
        submitText="Add User"
      />
    </>

  );
}
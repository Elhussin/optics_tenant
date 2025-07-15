'use client';
import { toast } from 'sonner';
import { BackButton } from '@/components/ui/button/ActionButtons';
import { Loading4 } from '@/components/ui/loding';
import DynamicFormGenerator from '@/components/generate/DynamicFormGenerator';
import { useParamValue } from '@/lib/hooks/useParamValue';

export default function UserEditPage() {
  const userId = useParamValue("userId");

  if (!userId) {
    return <Loading4 />
  }
  return (
    <div>
      <div className="main-header">
        <h2 className="title-1">Edit User</h2>
        <BackButton />
      </div>
      <DynamicFormGenerator
        schemaName="UserRequest"
        id={userId}
        alias="users_users_partial_update"
        submitText="Update User"
        mode="edit"
        onSuccess={() => toast.success("User updated successfully",)}
      />
    </div>
  );
}
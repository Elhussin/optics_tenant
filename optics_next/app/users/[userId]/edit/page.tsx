'use client';
import { toast } from 'sonner';
import { useParams } from 'next/navigation';
import { BackButton } from '@/components/ui/button/ActionButtons';
import { Loading4 } from '@/components/ui/button/loding';
import DynamicFormGenerator from '@/components/generate/DynamicFormGenerator';

export default function UserDetailPage() {
    const params = useParams();
    const userId = params.userId;

    if(!userId){
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
        onSuccess={() => toast.success("User updated successfully",)}
        submitText="Update User"
        alias="users_users_partial_update"
        mode="edit"
      />
    </div>
  );
}
'use client'
import { useParams } from 'next/navigation';
import { BackButton } from '@/components/ui/button/ActionButtons';
import ViewDetailsCard from '@/components/view/ViewDetailsCard';
import { generateViewFieldsWithLabels } from '@/lib/utils/generateViewFieldsFromSchema';
import { schemas } from '@/lib/api/zodClient';
import { Loading4 } from '@/components/ui/button/loding';

const fields = generateViewFieldsWithLabels(schemas.User, {
    hiddenFields: ["id", "password"],
    fieldLabels: {
      email: "User Email",
      first_name: "User First Name",
      last_name: "User Last Name",
      username: "User Username",
      role: "User Role",
      is_active: "User Is Active",
      is_deleted: "User Is Deleted",
    },
  });

export default function UserDetail() {
    const params = useParams();
    const { userId } = params;

    if(!userId){
        return <Loading4 />
    }
    return (
        
        <div className="max-w-4xl mx-auto p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">User Details</h1>
                <BackButton />
            </div>
                <ViewDetailsCard
                fields={fields}
                id={userId}
                alias="users_users_retrieve"
                restoreAlias="users_users_partial_update"
                hardDeleteAlias="users_users_destroy"
                path="/users"
                title="User Details"
                />
        </div>
    );
}


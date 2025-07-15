'use client';
import ViewDetailsCard from '@/components/view/ViewDetailsCard';
import { generateViewFieldsWithLabels } from '@/lib/utils/generateViewFields';
import { schemas } from '@/lib/api/zodClient'
import { useParamValue } from '@/lib/hooks/useParamValue';
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

  export default function UserDetilesPage() {
    const userId = useParamValue("userId");
    if(!userId){
        return <Loading4 />
    }
  
    return (
      <ViewDetailsCard
        id={userId}
        fields={fields}
        title="User Details"
        alias="users_users_retrieve"
        restoreAlias="users_users_partial_update"
        hardDeleteAlias="users_users_destroy"
        path="/users"

      />
    );
  }
  
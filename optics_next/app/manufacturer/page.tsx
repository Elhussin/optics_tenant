'use client';
import { GeneratedFormComponent } from '@/components/GeneratedFormComponent';
import ViewCard from '@/components/view/ViewCard';

export default function ManufacturerPage() {
    return (
<ViewCard
  alias="users_users_list"
  fieldsAlias="users_users_list"
  restoreAlias="users_users_restore"
  hardDeleteAlias="users_users_destroy"
  path="/manufacturer"
  viewFields={["name", "email", "role"]}
  title="Users List"
/>
    );
}

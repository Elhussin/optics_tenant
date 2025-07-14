
'use client';

import ViewCard from '@/components/view/ViewCard';

export default function UsersPage() {

    return (
<ViewCard
  alias="users_users_list"
  restoreAlias="users_users_restore"
  hardDeleteAlias="users_users_destroy"
  path="/users"
  viewFields={["username", "email", "role"]}
  title="Users List"
/>
    );
}


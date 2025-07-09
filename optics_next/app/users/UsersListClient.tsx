// ✅ app/users/UsersListClient.tsx
'use client';

import { useFilteredListRequest } from '@/lib/hooks/useFilteredListRequest';
import { SearchFilterForm } from '@/components/Search/SearchFilterForm';
import { generateSearchFieldsFromEndpoint } from '@/lib/utils/generateSearchFieldsFromEndpoint';
import { useEffect } from 'react';
import { useFormRequest } from '@/lib/hooks/useFormRequest';
import { toast } from 'sonner';
import ActionButtons from '@/components/ui/ActionButtons';
import Button from '@/components/ui/Button';
import { Plus } from 'lucide-react';
import { useCrudHandlers } from '@/lib/hooks/useCrudHandlers';



export default function UsersListClient() {
  const fields = generateSearchFieldsFromEndpoint('users_users_list');
  const users = useFilteredListRequest('users_users_list');

  const {
    handleView,
    handleEdit,
    handleCreate,
    handleDelete,
    handleRestore,
    handleHardDelete,
  } = useCrudHandlers('/users', {
    softDeleteAlias: 'users_users_partial_update',
    restoreAlias: 'users_users_partial_update',
    hardDeleteAlias: 'users_users_destroy', // DELETE /api/users/{id}/
    onSuccessRefresh: users.refetch,
  });





    useEffect(() => {
      users.refetch();
    }, []);
  
    return (

  <div className="body-container">
    <aside className="aside">
      <SearchFilterForm fields={fields} />
    </aside>
    <main className="main">
      <div className="main-header">
        <h2 className="title-1">Users</h2>
        <Button
          label="Create"
          onClick={() => handleCreate()}
          variant="primary"
          icon={<Plus size={16} />}
          className="md:mt-0 mt-4"
        />
      </div>

      <div className="card-continear">
        {users.data.map((user: any) => (
          <div key={user.id} className="cards">
            <h3 className="card-header">{user.username}</h3>
            <p className="card-body">{user.email}</p>
            <p className="card-body">{user.role}</p>
            <div className="btn-card">
              <ActionButtons
                onView={() => handleView(user.id)}
                onEdit={() => handleEdit(user.id)}
                showDeleteButton={true}
                // onSoftDelete={() => handleDelete(user.id)}
                // onRestore={() => handleRestore(user.id)}
                // onHardDelete={() => handleHardDelete(user.id)}
                // showRestoreButton={user.is_deleted}
                // showHardDeleteButton={!user.is_deleted}
              />
            </div>
          </div>
        ))}
      </div>
    </main>
  </div>

  );
}



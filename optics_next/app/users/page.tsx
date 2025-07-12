
'use client';
import { useFilteredListRequest } from '@/lib/hooks/useFilteredListRequest';
import { SearchFilterForm } from '@/components/Search/SearchFilterForm';
import { generateSearchFieldsFromEndpoint } from '@/lib/utils/generateSearchFieldsFromEndpoint';
import { useEffect } from 'react';
import ActionButtons from '@/components/ui/ActionButtons';
import Button from '@/components/ui/Button';
import { Plus } from 'lucide-react';
import { useCrudHandlers } from '@/lib/hooks/useCrudHandlers';
import {Loading} from '@/components/ui/loding';
import { useAside } from "@/lib/context/AsideContext";


export default function UsersPage() {

  const fields = generateSearchFieldsFromEndpoint('users_users_list');
  const users = useFilteredListRequest('users_users_list');

  const { handleCreate, handleView, handleEdit } = useCrudHandlers('/users', { onSuccessRefresh: users.refetch, });

  useEffect(() => {
    users.refetch();
  }, []);
  if (users.isLoading) return <Loading />;

  const { setAsideContent } = useAside();
  useEffect(() => {
    setAsideContent(
      <SearchFilterForm fields={fields} />
    );

    return () => {
      setAsideContent(null);
    };
  }, [setAsideContent]);
  return (
      <>
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
                />
              </div>
            </div>
          ))}
        </div>
      </>
  );
}

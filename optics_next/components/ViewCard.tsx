"use client";

import { generateSearchFieldsFromEndpoint } from "@/lib/utils/generateSearchFieldsFromEndpoint";
import { useFilteredListRequest } from "@/lib/hooks/useFilteredListRequest";
import { useCrudHandlers } from "@/lib/hooks/useCrudHandlers";
import ActionButtons from '@/components/ui/ActionButtons';
import Button from '@/components/ui/Button';
import { Plus } from 'lucide-react';
import { SearchFilterForm } from '@/components/Search/SearchFilterForm';
import { ViewCardProps } from '@/types';
import { formatLabel } from '@/lib/utils/formatLabel';


export default function ViewCard(props: ViewCardProps) {
  const {alias,fieldsAlias,restoreAlias,hardDeleteAlias,path,viewFields,title = "Items",} = props;
  const fields = generateSearchFieldsFromEndpoint(fieldsAlias);
  const data = useFilteredListRequest(alias);

  const {handleView,handleEdit,handleCreate,handleSoftDelete,handleRestore,handleHardDelete} = useCrudHandlers(path, {
    softDeleteAlias: restoreAlias,
    restoreAlias: restoreAlias,
    hardDeleteAlias: hardDeleteAlias,
    onSuccessRefresh: data.refetch,
  });



  return (
      <main className="main">
        <div className="main-header">
          <h2 className="title-1">{title}</h2>
          <Button
            label="Create"
            onClick={() => handleCreate()}
            variant="primary"
            icon={<Plus size={16} />}
            className="md:mt-0 mt-4"
          />
        </div>
        <div className="card-continear">
          {data.data?.map((item: any) => (
            <div key={item.id} className="cards">
              {viewFields?.map((field) => (
                <p key={field} className="card-body">
                  <strong>{formatLabel(field)}:</strong> {item[field]}
                </p>
              ))}
              <div className="btn-card">
                <ActionButtons 
                onView={() =>handleView(item.id)}
                onEdit={() => handleEdit(item.id) } 
                />
              </div>
            </div>
          ))}
        </div>
      </main>
  );
}

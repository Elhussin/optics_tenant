"use client";
import { useFilteredListRequest } from "@/lib/hooks/useFilteredListRequest";
import { useCrudHandlers } from "@/lib/hooks/useCrudHandlers";
import Button from '@/components/ui/buttons/Button';
import { Plus } from 'lucide-react';
import { ViewCardProps } from '@/types';
import { formatLabel } from '@/lib/utils/cardViewHelper';
import ViewButton from "@/components/ui/buttons/ViewButton";
import EditButton from "@/components/ui/buttons/EditButton";
import { generateSearchFieldsFromEndpoint } from "@/lib/utils/generateSearchFields";
import { useAside } from "@/lib/context/AsideContext";
import { useEffect } from "react";
import {SearchFilterForm} from "@/components/Search/SearchFilterForm";

export default function ViewCard(props: ViewCardProps) {
  const {alias,restoreAlias,hardDeleteAlias,path,viewFields,title = "Items",} = props;
  const data = useFilteredListRequest(alias);

  const {handleView,handleEdit,handleCreate,} = useCrudHandlers(path, {
    softDeleteAlias: restoreAlias,
    restoreAlias: restoreAlias,
    hardDeleteAlias: hardDeleteAlias,
    onSuccessRefresh: data.refetch,
  });

  
    const SearchFields = generateSearchFieldsFromEndpoint(alias);
    const { setAsideContent } = useAside();
    useEffect(() => {
      setAsideContent(
        <SearchFilterForm fields={SearchFields} />
      );
  
      return () => {
        setAsideContent(null);
      };
    }, [setAsideContent]);
  


  return (
      <>  
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
                <ViewButton onClick={() =>handleView(item.id)} />
                <EditButton onClick={() => handleEdit(item.id) } />
              </div>
            </div>
          ))}
        </div>
      </>
  );
}

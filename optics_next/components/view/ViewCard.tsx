"use client";
import { useFilteredListRequest } from "@/lib/hooks/useFilteredListRequest";
import { useCrudHandlers } from "@/lib/hooks/useCrudHandlers";
import { ViewCardProps } from '@/types';
import { formatLabel } from '@/lib/utils/cardViewHelper';
import {ViewButton,EditButton, CreateButton} from "@/components/ui/buttons/Button";
import { generateSearchFieldsFromEndpoint } from "@/lib/utils/generateSearchFields";
import { useAside } from "@/lib/context/AsideContext";
import { useEffect } from "react";
import {SearchFilterForm} from "@/components/Search/SearchFilterForm";

export default function ViewCard(props: ViewCardProps) {
  const {alias,restoreAlias,path,viewFields,title = "Items",} = props;
  const data = useFilteredListRequest(alias);

  const {handleView,handleEdit,handleCreate,} = useCrudHandlers(path, {
    softDeleteAlias: restoreAlias,
    restoreAlias: restoreAlias,
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
        <div className="head">
          <h2 className="title-1">{title}</h2>
          <CreateButton
            onClick={() => handleCreate()}
          />
        </div>
        <div className="card-continear">
          {data.data?.map((item: any) => (
            <div key={item.id} className="card">
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

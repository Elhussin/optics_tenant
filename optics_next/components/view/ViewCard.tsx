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

/**
 * ViewCard component displays a list of items in a card layout with CRUD (Create, Read, Update, Delete) operations.
 * 
 * @component
 * @param {ViewCardProps} props - The properties for the ViewCard component.
 * @param {string} props.alias - The API endpoint alias used to fetch and filter the list data.
 * @param {string} [props.restoreAlias] - Optional alias used for restoring soft-deleted items.
 * @param {string} props.path - The base path for CRUD operations.
 * @param {string[]} props.viewFields - The fields to display for each item in the card.
 * @param {string} [props.title="Items"] - The title displayed at the top of the card list.
 * 
 * @description
 * This component fetches a filtered list of items from a specified endpoint and renders them as cards.
 * Each card displays the specified fields and provides buttons for viewing and editing the item.
 * A create button is also provided to add new items. The component integrates with a side panel
 * to display a dynamic search filter form based on the endpoint's fields.
 * 
 * @example
 * <ViewCard
 *   alias="users"
 *   path="/users"
 *   viewFields={["name", "email"]}
 *   title="User List"
 * />
 */
export default function ViewCard(props: ViewCardProps) {

  const {alias,restoreAlias,path,viewFields,title = "Items",} = props;
  const data = useFilteredListRequest(alias);
  console.log("data", data);

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

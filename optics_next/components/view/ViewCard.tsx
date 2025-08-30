

"use client";
import { useFilteredListRequest } from "@/lib/hooks/useFilteredListRequest";
import { formatLabel } from "@/lib/utils/cardViewHelper";
import { generateSearchFieldsFromEndpoint } from "@/lib/utils/generateSearchFields";
import { SearchFilterForm } from "@/components/Search/SearchFilterForm";
import { formsConfig } from "@/config/formsConfig";
import { ActionButton } from "@/components/ui/buttons";
import { ArrowLeft, Eye, Pencil, Plus } from "lucide-react";
import { NotFound } from '@/components/NotFound';
import { Loading4 } from "@/components/ui/loding";
export default function ViewCard({ entity }: { entity: string }) {
  const form = formsConfig[entity];

  const {data,isLoading,errors} = useFilteredListRequest(form.listAlias);
  const SearchFields = generateSearchFieldsFromEndpoint(form.listAlias);
  
  if (!form) return <NotFound error="Invalid entity Detected" />;
  if (isLoading || !data ) return <Loading4 />;

  return (
    <>
      <SearchFilterForm fields={SearchFields} />
      <div className="head">
        <h2 className="title-1">{form.title}</h2>
        <div className="flex justify-end gap-2">
          <ActionButton label="Back" icon={<ArrowLeft size={16} />} variant="info" navigateTo={`/dashboard/`} />
          <ActionButton variant="info" icon={<Plus size={16} />} navigateTo={`/dashboard/${entity}/create`} label={form.createTitle} title={form.createTitle} />
        </div>
      </div>

      <div className="card-continear">
        {data?.map((item: any) => (
          <div key={item.id} className="card">
            {form.fields?.map((field) => (
              <p key={field} className="card-body">
                <strong>{formatLabel(field)}:</strong> {item[field]}
              </p>
            ))}
            <div className="btn-card">
              <ActionButton navigateTo={`/dashboard/${entity}/${item.id}`} icon={<Eye size={16} />} label={`View ${form.title}`} />
              <ActionButton navigateTo={`/dashboard/${entity}/${item.id}/edit`} icon={<Pencil size={16} />} label={`${form.updateTitle}`} />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
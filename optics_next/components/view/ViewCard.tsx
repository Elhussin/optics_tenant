

"use client";
import { useRouter } from "next/navigation";
import { useFilteredListRequest } from "@/lib/hooks/useFilteredListRequest";
import { formatLabel } from "@/lib/utils/cardViewHelper";
import { generateSearchFieldsFromEndpoint } from "@/lib/utils/generateSearchFields";
import { SearchFilterForm } from "@/components/Search/SearchFilterForm";
import { formsConfig } from "@/config/formsConfig";
import { ActionButton } from "@/components/ui/buttons";
import {ArrowLeft, Eye, Pencil, Plus} from "lucide-react";
export default function ViewCard({ entity }: { entity: string }) {

  const router = useRouter();
  const form = formsConfig[entity];
  console.log("form", form);

  if (!form) return <div>Invalid entity</div>;

  const data = useFilteredListRequest(form.listAlias);
  const SearchFields = generateSearchFieldsFromEndpoint(form.listAlias);

  const goTo = (params: Record<string, string>) => {
    const searchParams = new URLSearchParams(params);
    router.push(`/dashboard/${entity}?${searchParams.toString()}`);
  };

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
        {data.data?.map((item: any) => (
          <div key={item.id} className="card">
            {form.fields?.map((field) => (
              <p key={field} className="card-body">
                <strong>{formatLabel(field)}:</strong> {item[field]}
              </p>
            ))}
            <div className="btn-card">
              <ActionButton navigateTo={`/dashboard/${entity}/${item.id}`} icon={<Eye size={16}/>} label={`View ${form.title}`}  />
              <ActionButton onClick={() => goTo({ id: item.id, action: "edit" })} icon={<Pencil size={16} />} label={`${form.updateTitle}`}  />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

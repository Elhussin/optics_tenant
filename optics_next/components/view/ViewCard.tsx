

"use client";
import { useRouter } from "next/navigation";
import { useFilteredListRequest } from "@/lib/hooks/useFilteredListRequest";
import { formatLabel } from "@/lib/utils/cardViewHelper";
import { generateSearchFieldsFromEndpoint } from "@/lib/utils/generateSearchFields";
import { SearchFilterForm } from "@/components/Search/SearchFilterForm";
import { CreateButton, EditButton, ViewButton } from "@/components/ui/buttons/Button";
import { formsConfig } from "@/config/formsConfig";
import { BackButton } from "@/components/ui/buttons/Button";
import { ActionButton } from "@/components/ui/buttons";
export default function ViewCard({ entity }: { entity: string }) {
  const router = useRouter();
  const form = formsConfig[entity];

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
        <CreateButton onClick={() => goTo({ action: "create" })} label={form.createTitle} />
           <BackButton />
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
              <EditButton onClick={() => goTo({ id: item.id, action: "edit" })} label={form.updateTitle} />
              <ViewButton onClick={() => goTo({ id: item.id, action: "view" })} label={`View ${form.title}`} />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

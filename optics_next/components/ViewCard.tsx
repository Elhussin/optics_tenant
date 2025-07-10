"use client";

import { generateSearchFieldsFromEndpoint } from "@/lib/utils/generateSearchFieldsFromEndpoint";
import { useFilteredListRequest } from "@/lib/hooks/useFilteredListRequest";
import { useCrudHandlers } from "@/lib/hooks/useCrudHandlers";
import ActionButtons from '@/components/ui/ActionButtons';
import Button from '@/components/ui/Button';
import { Plus } from 'lucide-react';
import { SearchFilterForm } from '@/components/Search/SearchFilterForm';

interface Props {
  alias: string;
  fieldsAlias: string;
  restoreAlias: string;
  hardDeleteAlias: string;
  path: string;
  viewFields: string[]; // مثلا ["name", "email", "description"]
  title?: string;
}

function formatLabel(key: string): string {
    return key
      .replace(/_/g, ' ')               // استبدال "_" بمسافة
      .replace(/\b\w/g, c => c.toUpperCase()); // أول حرف من كل كلمة إلى حرف كبير
  }

export default function ViewCard(props: Props) {
  const {
    alias,
    fieldsAlias,
    restoreAlias,
    hardDeleteAlias,
    path,
    viewFields,
    title = "Items",
  } = props;

  const fields = generateSearchFieldsFromEndpoint(fieldsAlias);
  const data = useFilteredListRequest(alias);
  console.log("data",data);

  const {
    handleView,
    handleEdit,
    handleCreate,
  } = useCrudHandlers(path, {
    softDeleteAlias: restoreAlias,
    restoreAlias: restoreAlias,
    hardDeleteAlias: hardDeleteAlias,
    onSuccessRefresh: data.refetch,
  });

  return (
    <div className="body-container">
      <aside className="aside">
        <SearchFilterForm fields={fields} />
      </aside>
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
              {viewFields.map((field) => (
                <p key={field} className="card-body">
                  <strong>{formatLabel(field)}:</strong> {item[field]}
                </p>
              ))}
              <div className="btn-card">
                <ActionButtons
                  onView={() => handleView(item.id)}
                  onEdit={() => handleEdit(item.id)}
                />
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

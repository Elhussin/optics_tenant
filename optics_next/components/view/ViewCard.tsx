

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
import {useTranslations} from 'next-intl';
import {formatRelatedValue} from "@/lib/utils/formatRelatedValue";

export default function ViewCard({ entity }: { entity: string }) {

  const form = formsConfig[entity];
  const t = useTranslations('viewCard');
  const t2 = useTranslations(entity);

  
  const {data,isLoading} = useFilteredListRequest(form.listAlias);
  const SearchFields = generateSearchFieldsFromEndpoint(form.listAlias);
  
  if (!form) return <NotFound error={t('errorGetFormData')} />;
  if (isLoading || !data ) return <Loading4 />;

  return (
    <>
      <SearchFilterForm fields={SearchFields} />
      <div className="head">
        <h2 className="title-1">{t2("title")}</h2>
        <div className="flex justify-end gap-1">
          <ActionButton variant="success" icon={<Plus size={16} />} navigateTo={`/dashboard/${entity}/create`}  title={t('createTitle')} />
          <ActionButton  variant="success"  icon={<ArrowLeft size={16} />} navigateTo={`/dashboard/`} title={t('back')}/>
        </div>
      </div>
      <div className="card-continear">
      {data?.map((item: any) => (
        <div key={item.id} className="card">
          {form.fields?.map((field) => {
            const value = item[field];
            return (
              <p key={field} className="card-body flex">
              <strong className="mr-2 w-1/3 ">{t2(field)} :</strong>
              <span className="ml-2 w-2/3">{formatRelatedValue(value, field, t2)}</span>
            </p>            
            );
          })}
          <div className="btn-card">
            <ActionButton variant="info" navigateTo={`/dashboard/${entity}/${item.id}`} icon={<Eye size={16} />} title={t('view')}/> 
            <ActionButton variant="warning" navigateTo={`/dashboard/${entity}/${item.id}/edit`} icon={<Pencil size={16} />} title={t('edit')}/> 
          </div>
        </div>
      ))}

      </div>
    </>
  );
}
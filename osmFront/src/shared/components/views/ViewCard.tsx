

"use client";
import { useFilteredListRequest } from "@/src/shared/hooks/useFilteredListRequest";
import { SearchFilterForm } from "../search/SearchFilterForm";
import { formsConfig } from "@/src/features/dashboard/api/entityConfig";
import { ActionButton } from "@/src/shared/components/ui/buttons";
import { ArrowLeft, Eye, Pencil, Plus } from "lucide-react";
import { NotFound } from './NotFound';
import { Loading4 } from "../ui/loding";
import {useTranslations} from 'next-intl';
import {formatRelatedValue} from "@/src/shared/utils/formatRelatedValue";
import { useFilterDataOptions } from "@/src/shared/hooks/useFilterDataOptions";
import { Pagination } from "./Pagination";
export default function ViewCard({ entity }: { entity: string }) {

  const form = formsConfig[entity];
  const t = useTranslations('viewCard');
  const t2 = useTranslations(entity);

  const { data, count, page, setPage, setFilters, isLoading } = useFilteredListRequest(form.listAlias||"");
  const { fields, isLoading: isFieldsLoading, errors} = useFilterDataOptions(form.filterAlias||"");
  const totalPages = Math.ceil(count / 10);
  if (isLoading||isFieldsLoading) return <Loading4 />

 
  
  if (!form) return <NotFound error={t('errorGetFormData')} />;
  if (isLoading || !data ) return <Loading4 />;
  return (
    <>
      <SearchFilterForm fields={fields} setFilters={setFilters} />
      <div className="head">
        <h2 className="title-1">{t2("title")}</h2>
        <div className="flex justify-end gap-1">
          <ActionButton variant="success" icon={<Plus size={16} />} navigateTo={`/dashboard/${entity}/create`}  title={`${t('createTitle') } ${entity}`}/>
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
            <ActionButton variant="info" navigateTo={`/dashboard/${entity}/${item.id}`} icon={<Eye size={16} />} title={`${t('view')} ${entity}`}/> 
            <ActionButton variant="warning" navigateTo={`/dashboard/${entity}/${item.id}/edit`} icon={<Pencil size={16} />} title={`${t('edit')} ${entity}`}/> 
          </div>
        </div>
      ))}
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </div>
    </>
  );
}
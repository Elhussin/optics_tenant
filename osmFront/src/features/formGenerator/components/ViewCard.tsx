

"use client";
import { useFilteredListRequest } from "@/src/shared/hooks/useFilteredListRequest";
import { SearchFilterForm } from "../../../shared/components/search/SearchFilterForm";
import { formsConfig } from "@/src/features/formGenerator/constants/entityConfig";
import { ActionButton } from "@/src/shared/components/ui/buttons";
import { ArrowLeft, Eye, Pencil, Plus } from "lucide-react";
import { NotFound } from '../../../shared/components/views/NotFound';
import { Loading4 } from "../../../shared/components/ui/loding";
import { useTranslations } from 'next-intl';
import { useMergedTranslations } from '@/src/shared/utils/useMergedTranslations';
import { formatRelatedValue } from "@/src/shared/utils/formatRelatedValue";
import { useFilterDataOptions } from "@/src/shared/hooks/useFilterDataOptions";
import { Pagination } from "../../../shared/components/views/Pagination";
import { useSearchButton } from "@/src/shared/contexts/SearchButtonContext";
import { useEffect } from "react";
export default function ViewCard({ entity }: { entity: string }) {
  console.log(entity);
  const { filterAlias, listAlias, fields, isViewOnly } = formsConfig[entity];
  const t = useMergedTranslations(['viewCard', entity]);
  const { data, count, page, setPage, setFilters, isLoading, page_size, setPageSize, totalPages } = useFilteredListRequest({ alias: listAlias || "" });
  // show search button
  const { show } = useSearchButton();

  useEffect(() => {
    show();
  }, []);

  const { fields: filterFields, isLoading: isFieldsLoading } = useFilterDataOptions(filterAlias || "", {
    enabled: !!filterAlias,
  });

  if (isLoading || isFieldsLoading) return <Loading4 />;
  if (!data) return <NotFound error={t("noDataFound")} />;
  console.log(data);
  return (
    <div className="space-y-6">
      <SearchFilterForm fields={filterFields} setFilters={setFilters} />

      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
          <span className="w-1.5 h-6 bg-blue-500 rounded-full" />
          {t("title")}
          <span className="text-sm font-normal text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-md">
            {count}
          </span>
        </h2>
        <div className="flex gap-2">
          {!isViewOnly && (
            <ActionButton
              variant="success"
              icon={<Plus size={18} />}
              navigateTo={`/dashboard/${entity}/create`}
              title={`${t('createTitle')} ${entity}`}
              className="px-4 py-2"
            />
          )}
          <ActionButton
            variant="ghost"
            className="bg-secondary hover:bg-secondary/80 dark:hover:bg-secondary/80 border-0"
            icon={<ArrowLeft size={18} />}
            navigateTo={`/dashboard/`}
            title={t('back')}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {data?.map((item: any) => (
          <div key={item.id} className="group bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm hover:shadow-xl border border-gray-100 dark:border-gray-700 transition-all duration-300 transform hover:-translate-y-1">
            <div className="space-y-3 mb-4">
              {fields?.slice(0, 4).map((field, index) => { // Show first 4 fields only to keep card neat
                const value = item[field];
                return (
                  <div key={field} className="flex justify-between items-center text-sm border-b border-gray-50 dark:border-gray-700/50 pb-2 last:border-0 last:pb-0">
                    <span className="font-medium text-gray-500 dark:text-gray-400 capitalize">{t(field)}</span>
                    <span className={`font-semibold text-gray-800 dark:text-gray-200 truncate max-w-[60%] ${index === 0 ? "text-lg text-blue-600 dark:text-blue-400" : ""}`}>
                      {formatRelatedValue(value, field, t)}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end gap-2 pt-3 mt-2 border-t border-gray-100 dark:border-gray-700">
              <ActionButton
                className="h-9 w-9 p-0 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50"
                variant="custom" // Using custom to override defaults safely
                navigateTo={`/dashboard/${entity}/${item.id}`}
                icon={<Eye size={16} />}
                title={`${t('view')} ${entity}`}
              />
              {!isViewOnly && (
                <ActionButton
                  className="h-9 w-9 p-0 rounded-full bg-amber-50 text-amber-600 hover:bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400 dark:hover:bg-amber-900/50"
                  variant="custom"
                  navigateTo={`/dashboard/${entity}/${item.id}/edit`}
                  icon={<Pencil size={16} />}
                  title={`${t('edit')} ${entity}`}
                />
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 flex justify-center">
        <Pagination
          page={page}
          totalPages={totalPages}
          pageSize={page_size}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
        />
      </div>
    </div>
  );
}

"use client";
import React, { Suspense, useEffect } from 'react';
import { LoadingSpinner } from '@/src/shared/components/ui/loding';
import { Plus, ArrowLeft } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { ActionButton } from '@/src/shared/components/ui/buttons/';
import { useFilteredListRequest } from '@/src/shared/hooks/useFilteredListRequest';
import { useMergedTranslations } from '@/src/shared/utils/useMergedTranslations';
import { useSearchButton } from '@/src/shared/contexts/SearchButtonContext';
import { useFilterDataOptions } from '@/src/shared/hooks/useFilterDataOptions';
import { Loading4 } from '@/src/shared/components/ui/loding';
import { NotFound } from '@/src/shared/components/views/NotFound';
import { useParams } from 'next/navigation';
import { formsConfig } from '@/src/features/formGenerator/constants/entityConfig';
const ViewEyeTest = React.lazy(() => import('@/src/features/prescription/components/ViewEyeTest'));
export default function ProductsPage() {

  const entity = "products";
  console.log(entity);
  const { filterAlias, listAlias, fields, isViewOnly } = formsConfig[entity];
  console.log(filterAlias, listAlias, fields, isViewOnly);
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
  console.log(data);
  if (isLoading || isFieldsLoading) return <Loading4 />;
  if (!data) return <NotFound error={t("noDataFound")} />;

  return (
    <Suspense fallback={<div><LoadingSpinner /></div>}>

      <h2 className="text-lg font-bold mb-4 text-gray-800 dark:text-white flex items-center gap-2">
        <span className="w-1 h-6 bg-primary rounded-full"></span>
        {t('products')}
      </h2>
      <div className="flex gap-2">

        <ActionButton
          variant="success"
          icon={<Plus size={18} />}
          navigateTo={`/dashboard/products/create`}
          title={`${t('createTitle')}`}
          className="px-4 py-2"
        />
        <ActionButton
          variant="ghost"
          className="bg-secondary hover:bg-secondary/80 dark:hover:bg-secondary/80 border-0"
          icon={<ArrowLeft size={18} />}
          navigateTo={`/dashboard/`}
          title={t('back')}
        />
      </div>

    </Suspense>


  );
}



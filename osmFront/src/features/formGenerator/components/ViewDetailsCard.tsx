"use client";
import { formatRelatedValue } from "@/src/shared/utils/formatRelatedValue";
import { useRef, useEffect, useState, useCallback } from "react";
import { handleDownloadPDF, handleCopy, handlePrint, } from "@/src/shared/utils/cardViewHelper";
import { useMergedTranslations } from "@/src/shared/utils/useMergedTranslations";
import { ViewCardProps } from "@/src/shared/types";
import { RenderButtons } from "@/src/shared/components/ui/buttons/RenderButtons";
import { Loading4 } from "@/src/shared/components/ui/loding";
import { formsConfig } from "@/src/features/formGenerator/constants/entityConfig";
import { ActionButton } from "@/src/shared/components/ui/buttons";
import { NotFound } from "@/src/shared/components/views/NotFound";
import { Copy, Printer, FileText, ArrowLeft, Calendar, User, Hash } from "lucide-react";
import { useApiForm } from '@/src/shared/hooks/useApiForm';
import { useRouter } from "@/src/app/i18n/navigation";

export default function ViewDetailsCard(props: ViewCardProps) {
  const { entity, id } = props;
  const router = useRouter();
  const form = formsConfig[entity]
  const [data, setData] = useState<any | null>(null);
  const printRef = useRef<HTMLDivElement>(null);
  const t = useMergedTranslations(['viewDetailsCard', entity]);


  // hook لجلب البيانات
  const formRequest = useApiForm({
    alias: form.retrieveAlias,
    defaultValues: { id: Number(id) },
    onError: (err: any) => console.error(err),
  });

  // refetch function ثابتة
  const refetch = useCallback(async () => {
    if (id == null) return;
    const result = await formRequest.query.refetch();
    setData(result?.data);
  }, [id]);

  useEffect(() => {
    refetch();
  }, [refetch]);


  // حالات الخطأ واللودنج
  if (!entity || !id) return <NotFound error={t('entityError')} />;
  if (!form) return <NotFound error={t('noConfigError')} />;
  if (formRequest.isBusy || !data) return <Loading4 />;

  return (
    <div className="max-w-5xl mx-auto space-y-6 p-4">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            {t('detailsTitle')}
            {data?.is_deleted && (
              <span className="px-3 py-1 text-xs font-semibold text-red-700 bg-red-100 rounded-full border border-red-200">
                {t('deletedItem')}
              </span>
            )}
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-2 text-sm">
            <Hash size={14} /> ID: <span className="font-mono text-gray-700 dark:text-gray-300">{data?.id}</span>
            {data?.created_at && (
              <>• <Calendar size={14} /> {new Date(data.created_at).toLocaleDateString()}</>
            )}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Back Button */}
          <ActionButton
            variant="custom"
            className="h-10 px-4 rounded-xl bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all font-medium flex items-center gap-2 shadow-sm"
            title={t('back')}
            icon={<ArrowLeft size={18} />}
            onClick={() => router.back()}
            label={t('back')}
          />

          <div className="h-8 w-px bg-gray-200 dark:bg-gray-700 mx-1 hidden sm:block"></div>

          {/* Utility Group */}
          <div className="flex gap-1 bg-white dark:bg-gray-800 p-1 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <ActionButton
              variant="custom"
              className="h-9 w-9 p-0 rounded-lg hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-gray-700 dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
              title={t('copy')}
              icon={<Copy size={18} />}
              onClick={() => handleCopy(data, form.detailsField)}
            />
            <ActionButton
              variant="custom"
              className="h-9 w-9 p-0 rounded-lg hover:bg-purple-50 hover:text-purple-600 dark:hover:bg-gray-700 dark:text-gray-400 dark:hover:text-purple-400 transition-colors"
              title={t('print')}
              icon={<Printer size={18} />}
              onClick={() => handlePrint(printRef as React.RefObject<HTMLDivElement>, t('detailsTitle'))}
            />
            <ActionButton
              variant="custom"
              className="h-9 w-9 p-0 rounded-lg hover:bg-red-50 hover:text-red-600 dark:hover:bg-gray-700 dark:text-gray-400 dark:hover:text-red-400 transition-colors"
              title={t('pdf')}
              icon={<FileText size={18} />}
              onClick={() => handleDownloadPDF(printRef, `${form.title}-${data.id}`)}
            />
          </div>

          {/* CRUD Actions */}
          <RenderButtons
            data={data}
            alias={{
              editAlias: form.updateAlias!,
              deleteAlias: form.hardDeleteAlias!,
            }}
            isViewOnly={form.isViewOnly}
            navigatePath={`/dashboard/${entity}`}
            refetch={refetch}
          />
        </div>
      </div>

      <div ref={printRef} className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
        {/* Banner/Color Strip */}
        <div className="h-3 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 w-full" />

        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-8">
            {form.detailsField?.map((field: string) => {
              const value = data?.[field];
              // Skip rendering useless fields if empty, or render differently
              return (
                <div key={field} className="group border-b border-gray-100 dark:border-gray-700/50 pb-2 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors p-2 rounded-lg">
                  <dt className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">
                    {t(field)}
                  </dt>
                  <dd className="text-lg font-semibold text-gray-800 dark:text-gray-100 break-words">
                    {formatRelatedValue(value, field, t)}
                  </dd>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

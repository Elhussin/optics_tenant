"use client";
import {formatRelatedValue} from "@/src/shared/utils/formatRelatedValue";
import { useRef, useEffect, useState, useCallback } from "react";
import { 
  handleDownloadPDF, 
  handleCopy, 
  handlePrint,
} from "@/src/shared/utils/cardViewHelper";
import { useTranslations } from "next-intl";

import { ViewCardProps } from "@/src/shared/types";
import { RenderButtons } from "../ui/buttons/RenderButtons";
import { Loading4 } from "../ui/loding";
import { formsConfig } from "@/src/config/formsConfig";
import { ActionButton } from "../ui/buttons";
import { NotFound } from "./NotFound";
import { Copy, Printer, FileText } from "lucide-react";
import { useFormRequest } from '@/src/shared/hooks/useFormRequest';

export default function ViewDetailsCard(props: ViewCardProps) {
  const { entity, id } = props;
  const form = formsConfig[entity] 
  const [data, setData] = useState<any | null>(null);
  const printRef = useRef<HTMLDivElement>(null);
  const t = useTranslations('viewDetailsCard');
  const t2 = useTranslations(entity);

  // hook لجلب البيانات
  const formRequest = useFormRequest({
    alias: form.retrieveAlias,
    onSuccess: (res:any) => setData(res),
    onError: (err:any) => console.error(err),
  });

  // refetch function ثابتة
  const refetch = useCallback(() => {
    if (id == null) return;
    formRequest.submitForm({ id });
  }, [id]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  // حالات الخطأ واللودنج
  if (!entity || !id) return <NotFound error={t('entityError')} />;
  if (!form) return <NotFound error={t('noConfigError')} />;
  if (formRequest.isLoading || !data) return <Loading4 />;
  if (formRequest.error) return <NotFound error={t('errorLoadingData')} />;
  return (
    <div className="container-h">
      <div className="main-header">
        <h2 className="title-1 ">{t2('detailsTitle')}</h2>
        <hr className="hr" />
      </div>

      <div ref={printRef}>
        <div className="cards">

        {form.detailsField?.map((field: string) => {
        const value = data?.[field];
        return (
          <p key={field} className="card-body flex">
            <strong className="mr-2 w-1/3 ">
              {t2(field)} :
            </strong>
            <span className="ml-2 w-2/3">
            {formatRelatedValue(value, field, t2)}
            </span>
          </p>
        );
      })}

          {/* حالة الحذف */}
          {data?.is_deleted && (
            <p className="text-red-500 text-sm bg-red-50">
              {t('deletedItem')}
            </p>
          )}

          {/* الأزرار */}
          <div className="btn-card">
          <RenderButtons
                data={data}
                alias={{
                  editAlias: form.updateAlias,
                  deleteAlias: form.hardDeleteAlias,
                }}
                navigatePath={`/dashboard/${entity}`}
                refetch={refetch}
             />
            <div className="flex gap-2 mt-4">
              <ActionButton
                variant="info"
                title={t('copy')}
                icon={<Copy size={16} />}
                onClick={() => handleCopy(data, form.detailsField)}
              />
              <ActionButton
                variant="info"
                title={t('print')}
                icon={<Printer size={16} />}
                onClick={() => handlePrint(printRef as React.RefObject<HTMLDivElement>,t2('detailsTitle'))}
              />
              <ActionButton
                variant="info"
                title={t('pdf')}
                icon={<FileText size={16} />}
                onClick={() =>
                  handleDownloadPDF(printRef, `${form.title}-${data.id}`)
                }
              />
              
            </div >

          </div>
        </div>
      </div>
    </div>
  );
}

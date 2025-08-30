"use client";

import Image from "next/image";
import { useRef, useEffect, useState, useCallback } from "react";
import { 
  isValidDate, 
  formatDate, 
  isImageUrl, 
  handleDownloadPDF, 
  handleCopy, 
  handlePrint 
} from "@/lib/utils/cardViewHelper";

import { ViewCardProps } from "@/types";
import { RenderButtons } from "@/components/ui/buttons/RenderButtons";
import { Loading4 } from "@/components/ui/loding";
import { formsConfig } from "@/config/formsConfig";
import { ActionButton } from "@/components/ui/buttons";
import { NotFound } from "@/components/NotFound";
import { Copy, Printer, FileText } from "lucide-react";
import { useFormRequest } from '@/lib/hooks/useFormRequest';

export default function ViewDetailsCard(props: ViewCardProps) {
  const { entity, id } = props;
  const form = formsConfig[entity] 
  const [data, setData] = useState<any | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  // hook لجلب البيانات
  const formRequest = useFormRequest({
    alias: form.retrieveAlias,
    onSuccess: (res) => setData(res),
    onError: (err) => console.error(err),
  });

  // refetch function ثابتة
  const refetch = useCallback(() => {
    if (id == null) return;
    formRequest.submitForm({ id });
  }, [id]);
// formRequest
  // اجلب البيانات أول ما يفتح الكومبوننت أو يتغير id
  useEffect(() => {
    refetch();
  }, [refetch]);

  // حالات الخطأ واللودنج
  if (!entity || !id) return <NotFound error="Invalid entity or ID" />;
  if (!form) return <NotFound error="Invalid entity - No config Detected" />;
  if (formRequest.isLoading || !data) return <Loading4 />;
  if (formRequest.error) return <NotFound error="Error loading data" />;
  return (
    <div className="container">
      <div className="main-header">
        <h2 className="title-1">{form.detailsTitle}</h2>
      </div>

      <div ref={printRef}>
        <div className="cards">

          {/* عرض الحقول */}
          {Object.entries(form.DetailsField || {}).map(([key, label]) => {
            const value = data?.[key];
            return (
              <div key={key} className="card-body">
                <strong>{label}:</strong>{" "}
                {typeof value === "boolean" ? (
                  <span>{value ? "✅" : "❌"}</span>
                ) : typeof value === "string" && isImageUrl(value) ? (
                  <div className="mt-2">
                    <Image
                      src={value}
                      alt={key}
                      width={120}
                      height={120}
                      className="rounded-md border"
                    />
                  </div>
                ) : isValidDate(value) ? (
                  <span>{formatDate(value)}</span>
                ) : (
                  <span>{value ?? "N/A"}</span>
                )}
              </div>
            );
          })}

          {/* حالة الحذف */}
          {data?.is_deleted && (
            <p className="text-red-500 text-sm bg-red-50">
              This item is deleted. You can restore it or delete it permanently.
            </p>
          )}

          {/* الأزرار */}
          <div className="btn-card flex flex-col gap-2">
            <RenderButtons
              data={data}
              alias={{
                editAlias: form.updateAlias,
                deleteAlias: form.hardDeleteAlias,
              }}
              navigatePath={`/dashboard/${entity}`}
              refetch={refetch}
            />

            <div className="flex gap-2">
              <ActionButton
                variant="info"
                label="Copy"
                title="Copy Details"
                icon={<Copy size={16} />}
                onClick={() => handleCopy(data, form.DetailsField)}
              />
              <ActionButton
                variant="info"
                label="Print"
                title="Print Details"
                icon={<Printer size={16} />}
                onClick={() => handlePrint(printRef as React.RefObject<HTMLDivElement>)}
              />
              <ActionButton
                variant="info"
                label="PDF"
                title="Download PDF"
                icon={<FileText size={16} />}
                onClick={() =>
                  handleDownloadPDF(printRef, `${form.title}-${data.id}`)
                }
              />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

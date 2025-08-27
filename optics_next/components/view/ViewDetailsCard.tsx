"use client";
import Image from "next/image";
import { useRef, useEffect, useState } from "react";
import { isValidDate, formatDate, isImageUrl, handleDownloadPDF, handleCopy, handlePrint } from "@/lib/utils/cardViewHelper";
import { ViewCardProps } from "@/types";
import { RenderButtons } from "@/components/ui/buttons/RenderButtons";
import { Loading4 } from "@/components/ui/loding";

import { formsConfig } from "@/config/formsConfig";
import { ActionButton } from "@/components/ui/buttons";
import { useCallback } from "react";
import { NotFound } from "@/components/NotFound";
import { Copy, Printer, FileText } from "lucide-react";
import { useFetchData } from '@/lib/hooks/useCrudActions';

export default function ViewDetailsCard(props: ViewCardProps) {
  const { entity, id } = props;
  const form = entity ? formsConfig[entity] : null;
  const [data, setData] = useState<any | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  const { submitForm: getData } = useFetchData(
    "users_pages_retrieve",
    setData
  );
  
  const refetch = useCallback(() => {
    if (id == null) return;
    getData({ id: id });
  }, [getData, id]);
  
  useEffect(() => {
    refetch();
  }, [refetch]);
  


  if (!entity || !id) return <NotFound error="Invalid entity or ID" />;
  if (!form) return <NotFound error="Invalid entity No config Detected" />;
  if (!data) return <Loading4 />;

  return (
    <div className="container">
      <div className="main-header">
        <h2 className="title-1">{form.detailsTitle}</h2>
      </div>
      <div ref={printRef}>
        <div className="cards">
          <div className="flex justify-end">
   
          </div>

          {Object.entries(form.DetailsField || {}).map(([key, label]) => {
            const value = data?.[key];
            return (
              <div key={key} className="card-body">
                <strong>{label}:</strong>{" "}
                {typeof value === "boolean" ? (
                  <span>{value ? "✅" : "❌"}</span>
                ) : isImageUrl(value) ? (
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

          <div>
            <p className="text-red-500 text-sm bg-red-50">
              {data.is_deleted && "This item is deleted. You can restore it or delete it permanently."}
            </p>
          </div>

          <div className="btn-card flex flex-col gap-2">

              <div>
            <RenderButtons data={data} alias={{ editAlias: form.updateAlias, deleteAlias: form.hardDeleteAlias }} navigatePath={`/dashboard/${entity}`} refetch={refetch} />
         </div>
           <div className="flex gap-2">
           
            <ActionButton variant="info" label="Copy" title="Copy Details" icon={<Copy size={16} />} onClick={() => handleCopy(data, form.DetailsField)} />
            <ActionButton variant="info" label="Print" title="Print Details" icon={<Printer size={16} />} onClick={() => handlePrint(printRef as React.RefObject<HTMLDivElement>)} />
            <ActionButton variant="info" label="PDF" title="Download PDF" icon={<FileText size={16} />} onClick={() => handleDownloadPDF(printRef, `${form.title}-${data.id}`)} />
          </div>
          </div>
        </div>
      </div>
    </div>
  );
}

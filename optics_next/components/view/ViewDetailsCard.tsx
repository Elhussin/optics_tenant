"use client";
import Image from "next/image";
import { useRef, useEffect, useState } from "react";
import { isValidDate, formatDate, isImageUrl, handleDownloadPDF, handleCopy, handlePrint } from "@/lib/utils/cardViewHelper";
// import { usePageActions } from "@/lib/hooks/usePageActions";
import { ViewCardProps } from "@/types";
import { RenderButtons } from "../ui/buttons/RenderButtons";
// import {
//   EditButton, DeleteButton, RestoreButton, HardDeleteButton,
//   ActivateButton, DeactivateButton, BackButton, PDFButton, PrintButton, CopyButton
// } from "@/components/ui/buttons/Button";
import { Loading4 } from "@/components/ui/loding";
import { fetchData } from "@/lib/hooks/useCrudActions";
import { useHardDeleteWithDialog } from '@/lib/hooks/useHardDeleteWithDialog';
import { formsConfig } from "@/config/formsConfig";
import { ActionButton } from "../ui/buttons";

import { Copy, Printer, FileText } from "lucide-react";
export default function ViewDetailsCard(props: ViewCardProps) {
  const { entity, id } = props;
  const [data, setData] = useState<any | null>(null);

  if (!entity || !id) return <div>Invalid entity or ID</div>;

  const form = formsConfig[entity];
  if (!form) return <div>Invalid entity</div>;

  const getData = fetchData(form.retrieveAlias, setData);
  useEffect(() => { if (id) { getData({ id: id }); } }, [id]);

  // const printRef = useRef<HTMLElement>(null!) as React.RefObject<HTMLElement>;
  const printRef = useRef<HTMLDivElement>(null);
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
            {/* data, alias, refetch, navigatePath,id */}
              {/* const aliases = { deleteAlias:'users_pages_destroy', editAlias:'users_pages_partial_update' }; */}
              <div>
            <RenderButtons data={data} alias={{ editAlias: form.updateAlias, deleteAlias: form.hardDeleteAlias }} navigatePath={`/dashboard/${entity}?action=viewAll`} id={data.id} refetch={getData} />
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

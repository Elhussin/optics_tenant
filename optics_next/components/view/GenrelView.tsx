"use client";
import Image from "next/image";
import { useRef } from "react";
import { isValidDate, formatDate, isImageUrl, handleDownloadPDF } from "@/lib/utils/cardViewHelper";
import { handleCopy, handlePrint } from "@/lib/utils/cardViewHelper";
import { useCrudHandlers } from "@/lib/hooks/useCrudHandlers";
import { ViewCardProps } from "@/types";
import {
  EditButton, DeleteButton, RestoreButton, HardDeleteButton,
  ActivateButton, DeactivateButton, BackButton, PDFButton, PrintButton, CopyButton
} from "@/components/ui/buttons/Button";
import { Loading4 } from "@/components/ui/loding";
import { createFetcher } from "@/lib/hooks/useCrudFormRequest";
import { useHardDeleteWithDialog } from '@/lib/hooks/useHardDeleteWithDialog';
import { useEffect, useState } from "react";


export default function ViewDetailsCard(props: ViewCardProps) {
  const { alias, fields, id, restoreAlias, hardDeleteAlias, path, title = "Details", } = props;

  const [data, setData] = useState<any | null>(null);

  const fetchUser = createFetcher(alias, setData);
  useEffect(() => { if (id) { fetchUser({ id: id }); } }, [id]);

  const printRef = useRef<HTMLDivElement>(null);

  const { handleEdit, handleSoftDelete, handleRestore, handleActivate, handleDeactivate } = useCrudHandlers(path, {
    softDeleteAlias: restoreAlias,
    restoreAlias: restoreAlias,
    onSuccessRefresh: () => fetchUser({ id }),
  });
  const { confirmHardDelete, ConfirmDialogComponent, } = useHardDeleteWithDialog({ alias: hardDeleteAlias!, onSuccess: () => fetchUser({ id }) });

  const renderButtons = (data: any) => {

    return (
      <>
        {data.is_deleted ? (
          <>
            <RestoreButton onClick={() => handleRestore(data.id)} />
            <HardDeleteButton onClick={() => confirmHardDelete(data.id)} />
          </>
        ) : (
          <>
            <EditButton onClick={() => handleEdit(data.id)} />
            <DeleteButton onClick={() => handleSoftDelete(data.id)} />
          </>
        )}
        {data.is_active ? !data.is_deleted && (
          <DeactivateButton onClick={() => handleDeactivate(data.id)} />
        ) : !data.is_deleted && (
          <ActivateButton onClick={() => handleActivate(data.id)} />
        )}
      </>
    );
  }




  if (!data) {
    return <Loading4 />
  }


  return (
    <div className="container">
      <div className="main-header">

        <h2 className="title-1">{title}</h2>
        <div className="flex gap-2">
          <CopyButton
            onClick={() => handleCopy(data, fields)}
          />
          <PrintButton
            onClick={() => handlePrint()}
          />
          <PDFButton
            onClick={() => handleDownloadPDF(printRef, `${title}-${data.id}-${data.username}`)}
          />

        </div>
      </div>
      <div className="" ref={printRef}>

        <div className="cards">
          <div className="flex justify-end">
            <BackButton /></div>

          {fields?.map(({ key, label }) => {
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
                  <span>{String(value)}</span>
                )}

              </div>

            );
          })}
          <div>
            <p className="text-red-500 text-sm bg-red-50">{data.is_deleted && "This item is deleted You can restore it or delete it permanently  "}</p>
          </div>
          <div className="btn-card">
            {renderButtons(data)}
            {ConfirmDialogComponent}
          </div>
        </div>

      </div>
    </div>
  );
}




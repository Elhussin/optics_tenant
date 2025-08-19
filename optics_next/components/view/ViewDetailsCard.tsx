"use client";
import Image from "next/image";
import { useRef, useEffect, useState } from "react";
import { isValidDate, formatDate, isImageUrl, handleDownloadPDF, handleCopy, handlePrint } from "@/lib/utils/cardViewHelper";
import { usePageActions } from "@/lib/hooks/usePageActions";
import { ViewCardProps } from "@/types";
import {
  EditButton, DeleteButton, RestoreButton, HardDeleteButton,
  ActivateButton, DeactivateButton, BackButton, PDFButton, PrintButton, CopyButton
} from "@/components/ui/buttons/Button";
import { Loading4 } from "@/components/ui/loding";
import { createFetcher } from "@/lib/hooks/useCrudFormRequest";
import { useHardDeleteWithDialog } from '@/lib/hooks/useHardDeleteWithDialog';
import { formsConfig } from "@/config/formsConfig";

export default function ViewDetailsCard(props: ViewCardProps) {
  const { entity, id } = props;
  const [data, setData] = useState<any | null>(null);

  if (!entity || !id) return <div>Invalid entity or ID</div>;

  const form = formsConfig[entity];
  if (!form) return <div>Invalid entity</div>;

  const fetchUser = createFetcher(form.retrieveAlias, setData);
  useEffect(() => { if (id) { fetchUser({ id: id }); } }, [id]);

  const printRef = useRef<HTMLElement>(null);

  const { handleEdit, handleSoftDelete, handleRestore, handleActivate, handleDeactivate } = usePageActions(entity, {
    softDeleteAlias: form.updateAlias,
    restoreAlias: form.updateAlias,
    onSuccessRefresh: () => fetchUser({ id }),
  });

  const { confirmHardDelete, ConfirmDialogComponent } = useHardDeleteWithDialog({
    alias: form.hardDeleteAlias!,
    onSuccess: () => fetchUser({ id })
  });

  const renderButtons = (item: any) => (
    <>
      {item.is_deleted ? (
        <>
          <RestoreButton onClick={() => handleRestore(item.id)} />
          <HardDeleteButton onClick={() => confirmHardDelete(item.id)} />
        </>
      ) : (
        <>
          <EditButton onClick={() => handleEdit(item.id )} />
          
          <DeleteButton onClick={() => handleSoftDelete(item.id)} />
        </>
      )}
      {item.is_active ? !item.is_deleted && (
        <DeactivateButton onClick={() => handleDeactivate(item.id)} />
      ) : !item.is_deleted && (
        <ActivateButton onClick={() => handleActivate(item.id)} />
      )}
    </>
  );

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

          <div className="btn-card">
            {renderButtons(data)}
            {ConfirmDialogComponent}
            <CopyButton onClick={() => handleCopy(data, form.DetailsField)} />
          {/* <PrintButton onClick={() => handlePrint()} /> */}
          <PrintButton onClick={() => handlePrint(printRef )} />
          <PDFButton onClick={() => handleDownloadPDF(printRef, `${form.title}-${data.id}`)} />
          <BackButton />
          </div>
        </div>
      </div>
    </div>
  );
}

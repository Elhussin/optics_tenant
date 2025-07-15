"use client";
import Image from "next/image";
import { useRef } from "react";
import { isValidDate, formatDate, isImageUrl, handleDownloadPDF } from "@/lib/utils/cardViewHelper";
import { handleCopy, handlePrint } from "@/lib/utils/cardViewHelper";
import { useCrudHandlers } from "@/lib/hooks/useCrudHandlers";
import { ViewCardProps } from "@/types";
import EditButton from "@/components/ui/button/EditButton";
import DeleteButton from "@/components/ui/button/DeleteButton";
import RestoreButton from "@/components/ui/button/RestoreButton";
import HardDeleteButton from "@/components/ui/button/HardDeleteButton";
import { Loading4 } from "@/components/ui/button/loding";
import { createFetcher } from "@/lib/hooks/useCrudFormRequest";
import { useHardDeleteWithDialog } from '@/lib/hooks/useHardDeleteWithDialog';
import { useEffect, useState } from "react";
import Button from "@/components/ui/button/Button";
import { Copy, Printer, FileText } from "lucide-react";
import {BackButton} from "@/components/ui/button/ActionButtons";

export default function ViewDetailsCard(props: ViewCardProps) {
  const { alias, fields, id, restoreAlias, hardDeleteAlias, path, title = "Details", } = props;

  const [data, setData] = useState<any | null>(null);

  const fetchUser = createFetcher(alias, setData);
  useEffect(() => { if (id) { fetchUser({ id: id }); } }, [id]);

  console.log("View datils", data);
  const printRef = useRef<HTMLDivElement>(null);

  const { handleEdit, handleSoftDelete, handleRestore } = useCrudHandlers(path, {
    softDeleteAlias: restoreAlias,
    restoreAlias: restoreAlias,
    hardDeleteAlias: hardDeleteAlias,
    onSuccessRefresh: () => fetchUser({ id }),
  });
  const { confirmHardDelete, ConfirmDialogComponent, } = useHardDeleteWithDialog({ alias: hardDeleteAlias, onSuccess: () => fetchUser({ id }) });


  if (!data) {
    return <Loading4 />
  }


  return (
    <div className="container">
      <div className="main-header">

        <h2 className="title-1">{title}</h2>
        <div className="flex gap-2">
          <Button
          label="Copy"
          onClick={() => handleCopy(data, fields)}
          icon={<Copy size={16} />}
          />
          <Button
          label="Print"
          onClick={() => handlePrint()}
          icon={<Printer size={16} />}
          />
          <Button
          label="PDF"
          onClick={() => handleDownloadPDF(printRef, `${title}-${data.id}-${data.username}`)}
          icon={<FileText size={16} />}
          />
          
        </div>
      </div>
      <div className="" ref={printRef}>
    
        <div className="cards">
          <div className="flex justify-end">       <BackButton /></div>
    
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
            <p className="text-red-500 text-sm bg-red-50">{data.is_deleted && "This item is deleted You can restore it or delete it permanently  " }</p>
          </div>
          <div className="btn-card">
            {!data.is_deleted && <EditButton onClick={() => handleEdit(data.id)} />}

            {!data.is_deleted && <DeleteButton onClick={() => handleSoftDelete(data.id)} />}
            {data.is_deleted && <RestoreButton onClick={() => handleRestore(data.id)} />}
            {data.is_deleted && <HardDeleteButton onClick={() => confirmHardDelete(data.id)} />}
            {ConfirmDialogComponent}

          </div>
        </div>

      </div>
    </div>
  );
}



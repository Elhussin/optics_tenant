"use client";

import Image from "next/image";
import { useRef } from "react";
import { isValidDate, formatDate, isImageUrl, handleDownloadPDF } from "@/lib/utils/cardView";
import { handleCopy, handlePrint } from "@/lib/utils/cardView";
import { useCrudHandlers } from "@/lib/hooks/useCrudHandlers";
import { ViewCardProps } from "@/types";
import { useFilteredListRequest } from "@/lib/hooks/useFilteredListRequest";
import EditButton from "@/components/ui/button/EditButton";
import DeleteButton from "@/components/ui/button/DeleteButton";
import RestoreButton from "@/components/ui/button/RestoreButton";
import HardDeleteButton from "@/components/ui/button/HardDeleteButton";
import {Loading4} from "@/components/ui/loding";
export default function ViewDetailsCard(props: ViewCardProps) {
  const { alias, fields, item, restoreAlias, hardDeleteAlias, path, title = "Items", } = props;

  // const response = useFilteredListRequest(alias);
  console.log("View datils",item);  
  const printRef = useRef<HTMLDivElement>(null);

  const { handleView, handleEdit, handleSoftDelete, handleRestore, handleHardDelete } = useCrudHandlers(path, {
    softDeleteAlias: restoreAlias,
    restoreAlias: restoreAlias,
    hardDeleteAlias: hardDeleteAlias,
    // onSuccessRefresh: response.refetch,
  });


  if(!item){
    return <Loading4 />
  }


  return (
    <>
      <div className="main-header">
        <h2 className="title-1">{title}</h2>
        <div className="flex gap-2">
          <button className="btn" onClick={() => handleCopy(item, fields)}>📋 Copy</button>
          <button className="btn" onClick={() => handlePrint()}>🖨 Print</button>
          <button className="btn" onClick={() => handleDownloadPDF(printRef, title)}>📄 PDF</button>
        </div>
      </div>
      <div className="" ref={printRef}>
        <div className="cards">
          {fields?.map(({ key, label }) => {
            const value = item?.[key];

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
          <div className="btn-card">
          {/* {response.is} */}
            <EditButton onClick={() => handleEdit(item.id)} />
            <DeleteButton onClick={() => handleSoftDelete(item.id)} />
            <RestoreButton onClick={() => handleRestore(item.id)} />
            <HardDeleteButton onClick={() => handleHardDelete(item.id)} />
          </div>
        </div>

      </div>
    </>
  );
}



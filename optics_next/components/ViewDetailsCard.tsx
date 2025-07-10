"use client";

import Image from "next/image";
import { useRef } from "react";
import { isValidDate, formatDate ,isImageUrl ,handleDownloadPDF } from "@/lib/utils/cardView";
import { handleCopy, handlePrint } from "@/lib/utils/cardView";
import { useCrudHandlers } from "@/lib/hooks/useCrudHandlers";
import { ViewCardProps } from "@/types";
import { useFilteredListRequest } from "@/lib/hooks/useFilteredListRequest";
import ActionButtons from "@/components/ui/ActionButtons";


export default function ViewDetailsCard(props: ViewCardProps) {
  const {alias,fields,item,restoreAlias,hardDeleteAlias,path,title = "Items",} = props;

  const response = useFilteredListRequest(alias);
  const printRef = useRef<HTMLDivElement>(null);

  const {handleView,handleEdit,handleSoftDelete,handleRestore,handleHardDelete} = useCrudHandlers(path, {
softDeleteAlias: restoreAlias,
    restoreAlias: restoreAlias,
    hardDeleteAlias: hardDeleteAlias,
    onSuccessRefresh: response.refetch,
  });




  return (
    <div className="body-container">
        <div className="main-header flex justify-between items-center">
          <h2 className="title-1">{title}</h2>
          <div className="flex gap-2">
            <button className="btn" onClick={() => handleCopy(item, fields)}>📋 Copy</button>
            <button className="btn" onClick={() => handlePrint()}>🖨 Print</button>
            <button className="btn" onClick={() => handleDownloadPDF(printRef, title)}>📄 PDF</button>
          </div>
        </div>
        <div className="card-continear" ref={printRef}>
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
          </div>
          <div className="btn-card">
            <ActionButtons 
            onView={() =>handleView(item.id)}
            onEdit={() => handleEdit(item.id) } 
            onSoftDelete={() => handleSoftDelete(item.id)} 
            onRestore={() => handleRestore(item.id)} 
            onHardDelete={() => handleHardDelete(item.id)} 
            isAll={true}
            showRestoreButton={true} 
            showHardDeleteButton={true} />
          </div>
        </div>
    </div>
  );
}



"use client";

import Image from "next/image";
import { useRef } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

interface FieldMeta {
  key: string;
  label: string;
  zodType: any;
}

interface Props {
  item: Record<string, any>;
  fields: FieldMeta[];
  title?: string;
}

function isImageUrl(value: string): boolean {
  return typeof value === "string" && /\.(jpeg|jpg|png|gif|webp|svg)$/.test(value);
}

function isValidDate(value: any): boolean {
  return typeof value === "string" && !isNaN(Date.parse(value));
}

function formatDate(value: string): string {
  const date = new Date(value);
  return date.toLocaleString("ar-EG");
}

export default function ViewDetailsCard({ item, fields, title = "Details" }: Props) {
  const printRef = useRef<HTMLDivElement>(null);

  const handleCopy = () => {
    const text = fields.map(({ key, label }) => {
      const value = item[key];
      const formatted =
        typeof value === "boolean"
          ? value ? "✅" : "❌"
          : isValidDate(value)
          ? formatDate(value)
          : value;
      return `${label}: ${formatted}`;
    }).join("\n");

    navigator.clipboard.writeText(text);
    alert("✅ تم نسخ البيانات إلى الحافظة");
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    const element = printRef.current;
    if (!element) return;

    const canvas = await html2canvas(element);
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    pdf.addImage(imgData, "PNG", 0, 10, imgWidth, imgHeight);
    pdf.save(`${title}.pdf`);
  };

  return (
    <div className="body-container">
      <main className="main">
        <div className="main-header flex justify-between items-center">
          <h2 className="title-1">{title}</h2>
          <div className="flex gap-2">
            <button className="btn" onClick={handleCopy}>📋 نسخ</button>
            <button className="btn" onClick={handlePrint}>🖨 طباعة</button>
            <button className="btn" onClick={handleDownloadPDF}>📄 PDF</button>
          </div>
        </div>
        <div className="card-continear" ref={printRef}>
          <div className="cards">
            {fields.map(({ key, label }) => {
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
        </div>
      </main>
    </div>
  );
}


// @media print {
//   body * {
//     visibility: hidden;
//   }
//   .card-continear, .card-continear * {
//     visibility: visible;
//   }
//   .card-continear {
//     position: absolute;
//     left: 0;
//     top: 0;
//     width: 100%;
//   }
// }

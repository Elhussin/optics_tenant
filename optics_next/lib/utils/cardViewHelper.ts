import html2canvas from "html2canvas";
import jsPDF from "jspdf";


// utils/formatLabel.ts
export function formatLabel(field: string): string {
  return field
    .replace(/[_\-]+/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}


export function isImageUrl(value: string): boolean {
  return typeof value === "string" && /\.(jpeg|jpg|png|gif|webp|svg)$/.test(value);
}

export function isValidDate(value: any): boolean {
  return typeof value === "string" && !isNaN(Date.parse(value));
}

export function formatDate(value: string): string {
  const date = new Date(value);
  return date.toLocaleString("ar-EG");
}

export const handleDownloadPDF = async (printRef: any, title: string) => {
  const element = printRef.current;
  if (!element) return;


  const canvas = await html2canvas(element, {
    onclone: (clonedDoc) => {
      const els = clonedDoc.querySelectorAll('*');
      els.forEach((el) => {
        const style = getComputedStyle(el);
        if (style.color?.includes('oklch')) {
          (el as HTMLElement).style.color = '#000'; // افتراضي بديل
        }
        if (style.backgroundColor?.includes('oklch')) {
          (el as HTMLElement).style.backgroundColor = '#fff';
        }
      });
    }
  });

  const imgData = canvas.toDataURL("image/png");
  const pdf = new jsPDF("p", "mm", "a4");
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  const imgWidth = pageWidth;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  pdf.addImage(imgData, "PNG", 0, 10, imgWidth, imgHeight);
  pdf.save(`${title}.pdf`);
};


export const handleCopy = (item: any, fields: any) => {
  const text = fields.map(({ key, label }: any) => {
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
  alert("✅ Copied to clipboard");
};

export const handlePrint = () => {
  window.print();
};

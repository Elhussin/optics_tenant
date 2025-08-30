import html2canvas from "html2canvas";
import jsPDF from "jspdf";

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
  return date.toLocaleString("en-US");
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

export const handleCopy = (item: any, fields: Record<string, string>) => {
  const text = Object.entries(fields)
    .map(([key, label]) => {
      const value = item[key];
      const formatted =
        typeof value === "boolean"
          ? value
            ? "✅"
            : "❌"
          : isValidDate(value)
          ? formatDate(value)
          : value ?? "N/A";
      return `${label}: ${formatted}`;
    })
    .join("\n");

  navigator.clipboard.writeText(text);
  alert("✅ Copied to clipboard");
};

export const handlePrint = (printRef: React.RefObject<HTMLElement>) => {
  if (!printRef.current) {
    alert("Nothing to print");
    return;
  }

  const printContents = printRef.current.innerHTML;
  const originalContents = document.body.innerHTML;

  // افتح نافذة جديدة للطباعة
  const printWindow = window.open('', '', 'width=800,height=600');
  if (!printWindow) return;

  printWindow.document.write(`
    <html>
      <head>
        <title>Print Preview</title>
        <style>
          /* أضف هنا CSS خاص بالطباعة */
          body {
            font-family: Arial, sans-serif;
            margin: 20px;
          }
          @media print {
            /* يمكن إضافة المزيد من التنسيقات الخاصة */
          }
        </style>
      </head>
      <body>${printContents}</body>
    </html>
  `);

  printWindow.document.close();
  printWindow.focus();

  // اطبع المحتوى بعد تحميل الصفحة الجديدة
  printWindow.onload = () => {
    printWindow.print();
    printWindow.close();
  };
};

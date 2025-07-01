'use client'
import { UsePermission } from '@/lib/hooks/usePermission';

export default function InvoicePage() {
  const canCreateInvoice = UsePermission('create_invoice');

  if (!canCreateInvoice) {
    return <p>🚫 ليس لديك صلاحية لإنشاء الفاتورة</p>;
  }

  return (
    <div>
      <h1>إنشاء فاتورة جديدة</h1>
      {/* form هنا */}
    </div>
  );
}

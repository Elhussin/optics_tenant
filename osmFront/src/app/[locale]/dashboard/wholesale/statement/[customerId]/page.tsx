// app/[locale]/dashboard/wholesale/statement/[customerId]/page.tsx
/**
 * Customer Statement Page
 */

"use client";

import { useParams } from "next/navigation";
import { CustomerStatementPage } from "@/src/features/wholesale";

export default function StatementPage() {
  const params = useParams();
  const customerId = parseInt(params.customerId as string);

  if (!customerId || isNaN(customerId)) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-500">معرف العميل غير صالح</p>
      </div>
    );
  }

  return <CustomerStatementPage customerId={customerId} />;
}

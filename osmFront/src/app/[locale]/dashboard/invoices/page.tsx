"use client";

import React, { Suspense } from "react";
import { SectionLoading } from "@/src/shared/components/ui/Spinner";

const InvoicesListPage = React.lazy(
  () => import("@/src/features/invoices/pages/InvoicesListPage"),
);

export default function InvoicesPage() {
  return (
    <Suspense fallback={<SectionLoading />}>
      <InvoicesListPage />
    </Suspense>
  );
}

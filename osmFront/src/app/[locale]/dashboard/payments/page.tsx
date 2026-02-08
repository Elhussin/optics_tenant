"use client";

import React, { Suspense } from "react";
import { SectionLoading } from "@/src/shared/components/ui/Spinner";

const PaymentsListPage = React.lazy(() =>
  import("@/src/features/payment").then((module) => ({
    default: module.PaymentsListPage,
  })),
);

export default function PaymentsPage() {
  return (
    <Suspense fallback={<SectionLoading />}>
      <PaymentsListPage />
    </Suspense>
  );
}

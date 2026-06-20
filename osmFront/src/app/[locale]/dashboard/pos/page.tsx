"use client";

import React, { Suspense } from "react";
import { SectionLoading } from "@/src/shared/components/ui/Spinner";

const RetailPOSPage = React.lazy(() => 
  import("@/src/features/orders/pages/RetailPOSPage").then((mod) => ({ default: mod.RetailPOSPage }))
);

export default function POSRoutePage() {
  return (
    <Suspense fallback={<SectionLoading />}>
      <RetailPOSPage />
    </Suspense>
  );
}

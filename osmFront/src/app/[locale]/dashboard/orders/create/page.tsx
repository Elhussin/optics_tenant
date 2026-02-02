"use client";

import React, { Suspense } from "react";
import { SectionLoading } from "@/src/shared/components/ui/Spinner";

const CreateOrder = React.lazy(() => import("@/src/features/orders/create"));

export default function CreateOrderPage() {
  return (
    <Suspense fallback={<SectionLoading />}>
      <CreateOrder />
    </Suspense>
  );
}

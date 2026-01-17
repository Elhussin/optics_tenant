"use client";

import React, { Suspense } from "react";
import { Loading4 } from "@/src/shared/components/ui/loding";

const CreateOrder = React.lazy(() => import("@/src/features/orders/create"));

export default function CreateOrderPage() {
  return (
    <Suspense fallback={<Loading4 />}>
      <CreateOrder />
    </Suspense>
  );
}

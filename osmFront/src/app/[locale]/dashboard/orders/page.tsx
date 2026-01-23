"use client";

import React, { Suspense } from "react";
import { Loading4 } from "@/src/shared/components/ui/loding";

const OrdersListPage = React.lazy(
  () => import("@/src/features/orders/pages/OrdersListPage")
);

export default function OrdersPage() {
  return (
    <Suspense fallback={<Loading4 />}>
      <OrdersListPage />
    </Suspense>
  );
}

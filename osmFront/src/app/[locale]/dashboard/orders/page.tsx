"use client";

import React, { Suspense } from "react";
import { SectionLoading } from "@/src/shared/components/ui/Spinner";

const OrdersListPage = React.lazy(
  () => import("@/src/features/orders/pages/OrdersListPage"),
);

export default function OrdersPage() {
  return (
    <Suspense fallback={<SectionLoading />}>
      <OrdersListPage />
    </Suspense>
  );
}

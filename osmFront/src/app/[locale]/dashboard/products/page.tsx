"use client";

import React, { Suspense } from "react";
import { Loading4 } from "@/src/shared/components/ui/loding";

const ProductsList = React.lazy(() => import("@/src/features/products/list"));

export default function ProductsPage() {
  return (
    <div className="container mx-auto py-6 px-4">
      <Suspense fallback={<Loading4 />}>
        <ProductsList />
      </Suspense>
    </div>
  );
}

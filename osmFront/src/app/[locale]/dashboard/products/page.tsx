"use client";

import React, { Suspense } from "react";
import { SectionLoading } from "@/src/shared/components/ui/Spinner";

const ProductsList = React.lazy(
  () => import("@/src/features/products/components/viewProduct/list"),
);

export default function ProductsPage() {
  return (
    <div className="container mx-auto py-6 px-4">
      <Suspense fallback={<SectionLoading />}>
        <ProductsList />
      </Suspense>
    </div>
  );
}

"use client";
import React, { Suspense } from "react";
import { LoadingSpinner } from "@/src/shared/components/ui/loding";
const ProductForm = React.lazy(
  () => import("@/src/features/products/components/ProductForm")
);

export default function CreateProductPage() {
  return (
    <Suspense
      fallback={
        <div>
          <LoadingSpinner />
        </div>
      }
    >
      <ProductForm
        alias="products_product_create"

      />
    </Suspense>
  );
}

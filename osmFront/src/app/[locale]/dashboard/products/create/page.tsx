"use client";
import React, { Suspense } from "react";
import { LoadingSpinner } from "@/src/shared/components/ui/loding";
import { formsConfig } from "@/src/features/formGenerator/constants/entityConfig";

const ProductForm = React.lazy(() => import("@/src/features/products/add"));
export default function CreateProductPage() {
  return (
    <Suspense
      fallback={
        <div>
          <LoadingSpinner />
        </div>
      }
    >
      <ProductForm alias={formsConfig.product.createAlias} />
    </Suspense>
  );
}

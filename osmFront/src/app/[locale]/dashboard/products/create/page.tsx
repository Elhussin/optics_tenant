"use client";
import React, { Suspense } from "react";
import { SectionLoading } from "@/src/shared/components/ui/Spinner";


const ProductForm = React.lazy(() => import("@/src/features/products/add"));
export default function CreateProductPage() {
  return (
    <Suspense fallback={<SectionLoading />}>
      <ProductForm />
    </Suspense>
  );
}

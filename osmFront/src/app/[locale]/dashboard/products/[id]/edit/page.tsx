"use client";

import React, { Suspense, use } from "react";
import { SectionLoading } from "@/src/shared/components/ui/Spinner";
const ProductEdit = React.lazy(() => import("@/src/features/products/components/editProduct"));

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ProductEditPage({ params }: PageProps) {
  const { id } = use(params);
  return (
    <Suspense fallback={<SectionLoading />}>
      <ProductEdit productId={id} />
    </Suspense>
  );
}

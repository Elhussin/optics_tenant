"use client";

import React, { Suspense, use } from "react";
import { SectionLoading } from "@/src/shared/components/ui/Spinner";
const VariantEdit = React.lazy(
  () => import("@/src/features/products/components/variant/VariantEdit"),
);

interface PageProps {
  params: Promise<{ id: string; variantId: string }>;
}

export default function VariantEditPage({ params }: PageProps) {
  const { id, variantId } = use(params);
  return (
    <Suspense fallback={<SectionLoading />}>
      <VariantEdit variantId={variantId} productId={id} />
    </Suspense>
  );
}

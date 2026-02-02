"use client";

import React, { Suspense, use } from "react";
import { SectionLoading } from "@/src/shared/components/ui/Spinner";
import { VariantView } from "@/src/features/products/variant/view";

interface PageProps {
  params: Promise<{ id: string; variantId: string }>;
}

export default function VariantDetailsPage({ params }: PageProps) {
  const { id, variantId } = use(params);

  return (
    <Suspense fallback={<SectionLoading />}>
      <VariantView productId={id} variantId={variantId} />
    </Suspense>
  );
}

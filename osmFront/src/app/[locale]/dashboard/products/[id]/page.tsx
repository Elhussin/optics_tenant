"use client";

import React, { Suspense, use } from "react";
import { SectionLoading } from "@/src/shared/components/ui/Spinner";

const ProductView = React.lazy(
  () => import("@/src/features/products/components/viewProduct/viewDetails"),
);

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ProductViewPage({ params }: PageProps) {
  const { id } = use(params);
  return (
    <div className="container mx-auto py-6 px-4">
      <Suspense fallback={<SectionLoading />}>
        <ProductView productId={id} />
      </Suspense>
    </div>
  );
}

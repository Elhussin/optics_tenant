"use client";

import React, { Suspense, use } from "react";
import { SectionLoading } from "@/src/shared/components/ui/Spinner";
import { PageHeader } from "@/src/shared/components/ui/PageHeader";
import { useTranslations } from "next-intl";

const ProductView = React.lazy(() => import("@/src/features/products/view"));

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ProductViewPage({ params }: PageProps) {
  const { id } = use(params);
  const t = useTranslations("products.viewProduct");

  return (
    <div className="container mx-auto py-6 px-4">
      {/* <PageHeader
        title={t("title")}
        description={t("description")}
        backUrl="/dashboard/products"
        backTitle={t("backToProducts")}
      /> */}

      <Suspense fallback={<SectionLoading />}>
        <ProductView productId={id} />
      </Suspense>
    </div>
  );
}

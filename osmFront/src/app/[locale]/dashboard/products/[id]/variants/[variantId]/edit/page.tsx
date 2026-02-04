"use client";

import React, { Suspense, use } from "react";
import { SectionLoading } from "@/src/shared/components/ui/Spinner";
const VariantEdit = React.lazy(
  () => import("@/src/features/products/components/variant/VariantEdit"),
);
import { PageHeader } from "@/src/shared/components/ui/PageHeader";
import { useTranslations } from "next-intl";
interface PageProps {
  params: Promise<{ id: string; variantId: string }>;
}

export default function VariantEditPage({ params }: PageProps) {
  const { id, variantId } = use(params);
  const t = useTranslations("products");
  return (
    <Suspense fallback={<SectionLoading />}>
          <PageHeader
            title={t("variants.editVariant")}
            backUrl={`/dashboard/products/${id}/variants`}
            backTitle={t("actions.back")}
          />
      <VariantEdit variantId={variantId} productId={id} />
    </Suspense>
  );
}

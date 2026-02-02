"use client";

import React, { Suspense, use } from "react";
import { SectionLoading } from "@/src/shared/components/ui/Spinner";
import { ArrowRight } from "lucide-react";
import { ActionButton } from "@/src/shared/components/ui/buttons";
import { useApiForm } from "@/src/shared/hooks/useApiForm";
import { NotFound } from "@/src/shared/components/views/NotFound";
import { useRouter } from "next/navigation";
import { featuresConfig } from "@/src/shared/constants/entityConfig";
import { useTranslations } from "next-intl";
import { PageHeader } from "@/src/shared/components/ui/PageHeader";
const AddVariant = React.lazy(
  () => import("@/src/features/products/variant/AddVariant"),
);

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function AddVariantPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const numericId = parseInt(id, 10);

  const t = useTranslations("products.variants");

  // Fetch product to get variant_type and type
  const { query, isBusy } = useApiForm({
    alias: featuresConfig["product"].retrieveAlias,
    defaultValues: { id: numericId },
    enabled: !isNaN(numericId),
  });

  const { data: product, isLoading, isError } = query;

  if (isLoading || isBusy) {
    return <SectionLoading />;
  }

  if (isError || !product) {
    return <NotFound error={t("noProduct")} />;
  }

  return (
    <div className="container mx-auto py-6 px-4">
      {/* Header
      <div className="flex items-center gap-4 mb-6">
        <ActionButton
          icon={<ArrowRight size={20} />}
          variant="ghost"
          navigateTo={`/dashboard/products/${id}`}
          title={t("backToProduct")}
        />
        <div>
          <h1 className="text-2xl font-bold text-main">{t("addNew")}</h1>
          <p className="text-sm text-secondary">
            {t("forProduct")}:{" "}
            {product.name || `${product.brand_name} ${product.model}`}
          </p>
        </div>
      </div> */}
      <PageHeader
        title={t("addNew")}
        description={t("forProduct") + ": " + (product.name || `${product.brand_name} ${product.model}`)}
        backUrl={`/dashboard/products/${id}`}
        backTitle={t("backToProduct")}
      />

      <Suspense fallback={<SectionLoading />}>
        <AddVariant
          productId={numericId}
          variantType={product.variant_type}
          productType={product.type}
          onSuccess={() => {
            router.push(`/dashboard/products/${id}`);
          }}
          onCancel={() => {
            router.push(`/dashboard/products/${id}`);
          }}
        />
      </Suspense>
    </div>
  );
}

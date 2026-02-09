"use client";

import React, { useEffect } from "react";
import { SectionLoading } from "@/src/shared/components/ui/Spinner";
import { NotFound } from "@/src/shared/components/views/NotFound";
import { useApiForm } from "@/src/shared/hooks/useApiForm";
import { formsConfig } from "@/src/shared/constants/formsConfig";

interface VariantEditProps {
  variantId: string;
  productId: string;
}

import { useTranslations } from "next-intl";
import AddVariant from "./AddVariant";

export function VariantEdit({ variantId, productId }: VariantEditProps) {
  const t = useTranslations("products");
  // Convert productId to number
  const numericId = parseInt(variantId, 10);
  const numericProductId = parseInt(productId, 10);

  // Fetch product data
  const { query, isBusy } = useApiForm({
    alias: formsConfig["product-variants"].retrieveAlias || "", // ← صحيح: retrieve للمنتج
    defaultValues: { id: numericId }, // ← number وليس string
    enabled: !isNaN(numericId), // ← فقط إذا كان الـ id صحيح
  });

  const { data, isLoading, isError } = query;

  useEffect(() => {
    if (!isNaN(numericId)) {
      query.refetch();
    }
  }, [numericId]);

  if (isLoading || isBusy) {
    return <SectionLoading />;
  }

  if (isError || !data) {
    return <NotFound error={t("view.productNotFound")} />;
  }

  // Pass the fetched data as initialData to ProductAdd
  return (
    <AddVariant
      variantId={numericId}
      productId={numericProductId}
      variantType={data.product_variant_type}
      productType={data.product_type_code}
      initialData={data} // ← تمرير البيانات المحملة
    />
  );
}

export default VariantEdit;

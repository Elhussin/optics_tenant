"use client";

import React, { useEffect } from "react";
import { SectionLoading } from "@/src/shared/components/ui/Spinner";
import { NotFound } from "@/src/shared/components/views/NotFound";
import { useApiForm } from "@/src/shared/hooks/useApiForm";
import { ProductAdd } from "@/src/features/products/add";
import {  featuresConfig } from "@/src/shared/constants/entityConfig";

interface ProductEditProps {
  productId: string;
}

import { useTranslations } from "next-intl";

export function ProductEdit({ productId }: ProductEditProps) {
  const t = useTranslations("products");
  // Convert productId to number
  const numericId = parseInt(productId, 10);

  // Fetch product data
  const { query, isBusy } = useApiForm({
    alias: featuresConfig.product.retrieveAlias || "", // ← صحيح: retrieve للمنتج
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
    <ProductAdd
      id={productId}
      initialData={data} // ← تمرير البيانات المحملة
    />
  );
}

export default ProductEdit;

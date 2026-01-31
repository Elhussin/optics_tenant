"use client";

import React, { useEffect } from "react";
import { Loading4 } from "@/src/shared/components/ui/loding";
import { NotFound } from "@/src/shared/components/views/NotFound";
import { useApiForm } from "@/src/shared/hooks/useApiForm";
import { ProductAdd } from "@/src/features/products/add";
import { formsConfig } from "@/src/features/formGenerator/constants/entityConfig";

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
    alias: formsConfig["product"].retrieveAlias || "", // ← صحيح: retrieve للمنتج
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
    return <Loading4 />;
  }

  if (isError || !data) {
    return <NotFound error={t("view.productNotFound")} />;
  }

  // Pass the fetched data as initialData to ProductAdd
  return (
    <ProductAdd
      alias="products_products_update"
      id={productId}
      initialData={data} // ← تمرير البيانات المحملة
    />
  );
}

export default ProductEdit;

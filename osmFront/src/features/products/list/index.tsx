"use client";

import React from "react";
import { SectionLoading } from "@/src/shared/components/ui/Spinner";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/shared/components/ui/card";
import { ActionButton } from "@/src/shared/components/ui/buttons";
import { Pencil, Eye, Plus, Package } from "lucide-react";
import { useFilteredListRequest } from "@/src/shared/hooks/useFilteredListRequest";
import { useFilterDataOptions } from "@/src/shared/hooks/useFilterDataOptions";
import { SearchFilterForm } from "@/src/shared/components/search/SearchFilterForm";
import { Pagination } from "@/src/shared/components/views/Pagination";
import { useTranslations } from "next-intl";
import { featuresConfig } from "@/src/shared/constants/entityConfig";
import { ProductCard } from "../components/ProductCard";
import { PageHeader } from "@/src/shared/components/ui/PageHeader";
import { Badge } from "@/src/shared/components/ui/Badge";
import { GlassCard } from "@/src/shared/components/ui/GlassCard";
import { useSearchButton } from "@/src/shared/contexts/SearchButtonContext";
import { useEffect } from "react";
export function ProductsList() {
  const t = useTranslations("products");
  const { show } = useSearchButton();
  const {
    data,
    isLoading,
    count,
    totalPages,
    page,
    page_size,
    setPage,
    setPageSize,
    setFilters,
  } = useFilteredListRequest({ alias: featuresConfig.product.listAlias || "" });

  useEffect(() => {
    show();
  }, [show]);

  const { fields, isLoading: isFieldsLoading } = useFilterDataOptions(
    featuresConfig.product.filterAlias || "",
    {
      enabled: !!featuresConfig.product.filterAlias,
    },
  );

  if (isLoading || isFieldsLoading) return <SectionLoading />;

  return (
    <div className="space-y-6">
      {/* Header */}

      <PageHeader
        title={t("list.title")}
        description={t("list.totalProducts", { count: count || 0 })}
        icon={<Package />}
        badge={<Badge variant="success">{t("list.title")}</Badge>}
        backUrl="/dashboard/products"
        backTitle={t("actions.back")}
      >
        <ActionButton
          label={t("actions.add")}
          icon={<Plus size={18} />}
          variant="primary"
          navigateTo="/dashboard/products/create"
        />
      </PageHeader>

      {/* Search & Filters */}
      {fields?.length > 0 && (
        <SearchFilterForm fields={fields} setFilters={setFilters} />
      )}

      {/* Products Grid */}
      {data?.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Package
            size={64}
            className="text-gray-300 dark:text-gray-600 mb-4"
          />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
            {t("list.noProducts")}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {t("list.startAdding")}
          </p>
          <ActionButton
            label={t("actions.add")}
            icon={<Plus size={18} />}
            variant="primary"
            navigateTo="/dashboard/products/create"
            className="mt-4"
          />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {data?.map((product: any) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination
          page={page}
          totalPages={totalPages}
          pageSize={page_size}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
        />
      )}
    </div>
  );
}

export default ProductsList;

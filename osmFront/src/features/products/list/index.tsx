"use client";

import React from "react";
import { Loading4 } from "@/src/shared/components/ui/loding";
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
import { formsConfig } from "@/src/features/formGenerator/constants/entityConfig";
import { ProductCard } from "../components/ProductCard";
// ... (imports)


export function ProductsList() {
  const t = useTranslations("products");
  // const { show } = useSearchButton(); // Removed non-existent hook
  // show();

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
  } = useFilteredListRequest({ alias: formsConfig["product"].listAlias || "" });
  

  const { fields, isLoading: isFieldsLoading } =  useFilterDataOptions(formsConfig["product"].filterAlias || "", {
      enabled: !!formsConfig["product"].filterAlias,
    });

  if (isLoading || isFieldsLoading) return <Loading4 />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-main">{t("list.title")}</h1>
          <p className="text-sm text-secondary mt-1">
            {t("list.totalProducts", { count: count || 0 })}
          </p>
        </div>
        <ActionButton
          label={t("actions.add")}
          icon={<Plus size={18} />}
          variant="primary"
          navigateTo="/dashboard/products/create"
        />
      </div>

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

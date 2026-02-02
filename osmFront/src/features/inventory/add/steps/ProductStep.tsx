"use client";

import React, { useState, useMemo } from "react";
import { Package, Search, CheckCircle, AlertTriangle, Box } from "lucide-react";
import { SectionLoading } from "@/src/shared/components/ui/Spinner";
import { Input } from "@/src/shared/components/shadcn/ui/input";
import { Button } from "@/src/shared/components/shadcn/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/src/shared/components/shadcn/ui/tabs";
import { useInventoryFormStore } from "../../store";
import useSWR from "swr";
import api from "@/src/shared/api/axios";
import { Stock } from "../../types";
import { extractArrayData } from "@/src/shared/utils/apiHelpers";

interface ProductVariant {
  id: number;
  sku: string;
  product: {
    id: number;
    name: string;
    brand: { name: string };
    type: string;
  };
  selling_price: string;
  last_purchase_price: string | null;
}

export function ProductStep() {
  const store = useInventoryFormStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"existing" | "new">("existing");

  // Fetch existing stocks for the selected branch
  const { data: stocks = [], isLoading: stocksLoading } = useSWR<Stock[]>(
    store.branchId ? ["stocks_by_branch", store.branchId] : null,
    async () => {
      const response = await api.customRequest("products_stocks_list", {
        branch: store.branchId,
      });
      return extractArrayData<Stock>(response);
    },
    { revalidateOnFocus: false },
  );

  // Fetch all product variants for adding new stock
  const { data: variants = [], isLoading: variantsLoading } = useSWR<
    ProductVariant[]
  >(
    activeTab === "new" ? "products_variants_list" : null,
    async () => {
      const response = await api.customRequest("products_variants_list", {});
      return extractArrayData<ProductVariant>(response);
    },
    { revalidateOnFocus: false },
  );

  // Filter existing stocks - with safe array check
  const filteredStocks = useMemo(() => {
    if (!stocks || !Array.isArray(stocks)) return [];

    return stocks.filter(
      (stock) =>
        stock.variant_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        stock.variant_sku?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        stock.product_name?.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [stocks, searchQuery]);

  // Filter variants not in stock - with safe array check
  const filteredVariants = useMemo(() => {
    if (!variants || !Array.isArray(variants)) return [];

    const stockedVariantIds = new Set((stocks || []).map((s) => s.variant));

    return variants.filter(
      (variant) =>
        !stockedVariantIds.has(variant.id) &&
        (variant.sku?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          variant.product?.name
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase())),
    );
  }, [variants, stocks, searchQuery]);

  const handleSelectStock = (stock: Stock) => {
    store.setStock(stock.id, stock.quantity_in_stock);
    store.setVariant(stock.variant, stock.variant_name, stock.variant_sku);
  };

  const handleSelectVariant = (variant: ProductVariant) => {
    store.setStock(null, 0);
    store.setVariant(variant.id, variant.product.name, variant.sku);
    if (variant.last_purchase_price) {
      store.setCostPerUnit(parseFloat(variant.last_purchase_price));
    }
  };

  const getStockStatusColor = (status: string) => {
    switch (status) {
      case "In Stock":
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300";
      case "Low Stock":
        return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300";
      case "Out of Stock":
        return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as "existing" | "new")}
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="existing" className="gap-2">
            <Box className="w-4 h-4" />
            منتجات موجودة في المخزون
          </TabsTrigger>
          <TabsTrigger value="new" className="gap-2">
            <Package className="w-4 h-4" />
            إضافة منتج جديد للمخزون
          </TabsTrigger>
        </TabsList>

        {/* Search */}
        <div className="relative mt-4">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            placeholder="ابحث بالاسم أو الكود..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-10"
          />
        </div>

        {/* Existing Stocks Tab */}
        <TabsContent value="existing" className="mt-4">
          {stocksLoading ? (
            <SectionLoading message="جاري التحميل..." />
          ) : filteredStocks?.length === 0 ? (
            <div className="text-center py-12">
              <Box className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-main mb-2">
                لا توجد منتجات في المخزون
              </h3>
              <p className="text-secondary mb-4">
                يمكنك إضافة منتج جديد للمخزون من التبويب الثاني
              </p>
              <Button onClick={() => setActiveTab("new")} variant="outline">
                إضافة منتج جديد
              </Button>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {filteredStocks?.map((stock) => (
                <div
                  key={stock.id}
                  onClick={() => handleSelectStock(stock)}
                  className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all hover:shadow-md ${
                    store.stockId === stock.id
                      ? "border-primary bg-primary/5 shadow-md"
                      : "border-gray-200 dark:border-gray-700 hover:border-primary/50"
                  }`}
                >
                  {/* Selected indicator */}
                  {store.stockId === stock.id && (
                    <div className="absolute top-3 left-3">
                      <CheckCircle className="w-5 h-5 text-primary" />
                    </div>
                  )}

                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-main">
                        {stock.product_name}
                      </h3>
                      <p className="text-sm text-secondary">
                        {stock.variant_name}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        SKU: {stock.variant_sku}
                      </p>
                    </div>

                    <div className="text-left">
                      <div className="text-2xl font-bold text-main">
                        {stock.available_quantity}
                      </div>
                      <p className="text-xs text-secondary">متاح</p>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="flex items-center gap-2 mt-3">
                    <span
                      className={`px-2 py-0.5 text-xs rounded-full ${getStockStatusColor(
                        stock.stock_status,
                      )}`}
                    >
                      {stock.stock_status === "In Stock" && "متوفر"}
                      {stock.stock_status === "Low Stock" && "مخزون منخفض"}
                      {stock.stock_status === "Out of Stock" && "نفذ المخزون"}
                      {stock.stock_status === "Overstocked" && "مخزون زائد"}
                    </span>
                    {stock.stock_status === "Low Stock" && (
                      <AlertTriangle className="w-4 h-4 text-amber-500" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* New Products Tab */}
        <TabsContent value="new" className="mt-4">
          {variantsLoading ? (
            <SectionLoading message="جاري التحميل..." />
          ) : filteredVariants?.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-main mb-2">
                {searchQuery
                  ? "لا توجد نتائج"
                  : "جميع المنتجات موجودة في المخزون"}
              </h3>
              <p className="text-secondary">
                {searchQuery
                  ? "جرب البحث بكلمات مختلفة"
                  : "يمكنك تعديل كميات المنتجات الموجودة من التبويب الأول"}
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {filteredVariants?.map((variant) => (
                <div
                  key={variant.id}
                  onClick={() => handleSelectVariant(variant)}
                  className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all hover:shadow-md ${
                    store.variantId === variant.id && !store.stockId
                      ? "border-primary bg-primary/5 shadow-md"
                      : "border-gray-200 dark:border-gray-700 hover:border-primary/50"
                  }`}
                >
                  {/* Selected indicator */}
                  {store.variantId === variant.id && !store.stockId && (
                    <div className="absolute top-3 left-3">
                      <CheckCircle className="w-5 h-5 text-primary" />
                    </div>
                  )}

                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-main">
                        {variant.product?.name}
                      </h3>
                      <p className="text-sm text-secondary">
                        {variant.product?.brand?.name} - {variant.product?.type}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        SKU: {variant.sku}
                      </p>
                    </div>

                    <div className="text-left">
                      <div className="text-lg font-bold text-primary">
                        {parseFloat(variant.selling_price).toFixed(2)} ر.س
                      </div>
                      <p className="text-xs text-secondary">سعر البيع</p>
                    </div>
                  </div>

                  {variant.last_purchase_price && (
                    <div className="mt-2 text-xs text-gray-500">
                      آخر سعر شراء:{" "}
                      {parseFloat(variant.last_purchase_price).toFixed(2)} ر.س
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

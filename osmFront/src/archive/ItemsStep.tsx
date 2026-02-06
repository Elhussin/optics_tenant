"use client";

import React, { useState, useMemo } from "react";
import {
  Package,
  Search,
  Plus,
  Minus,
  Trash2,
  AlertTriangle,
  ShoppingCart,
} from "lucide-react";
import { Input } from "@/src/shared/components/shadcn/ui/input";
import { Button } from "@/src/shared/components/shadcn/ui/button";
import { useTransferFormStore } from "../../../store";
import { TransferItem, Stock } from "../../../types";
import useSWR from "swr";
import api from "@/src/shared/api/axios";
import { extractArrayData } from "@/src/shared/utils/apiHelpers";
import { useTranslations } from "next-intl";

export function ItemsStep() {
  const t = useTranslations("inventory");
  const store = useTransferFormStore();
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch stocks for the source branch
  const { data: stocks = [], isLoading } = useSWR<Stock[]>(
    store.fromBranchId ? ["stocks_by_branch", store.fromBranchId] : null,
    async () => {
      const response = await api.customRequest("products_stocks_list", {
        branch: store.fromBranchId,
      });
      return extractArrayData<Stock>(response);
    },
    { revalidateOnFocus: false },
  );

  // Filter available stocks (with available quantity > 0) - with safe array check
  const availableStocks = useMemo(() => {
    if (!stocks || !Array.isArray(stocks)) return [];

    return stocks.filter(
      (stock) =>
        stock.available_quantity > 0 &&
        (stock.variant_name
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
          stock.variant_sku
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          stock.product_name
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase())),
    );
  }, [stocks, searchQuery]);

  // Check if item already added
  const isItemAdded = (variantId: number) => {
    return store.items.some((item) => item.variantId === variantId);
  };

  // Get added item
  const getAddedItem = (variantId: number) => {
    return store.items.find((item) => item.variantId === variantId);
  };

  // Add item to transfer
  const handleAddItem = (stock: Stock) => {
    const newItem: TransferItem = {
      variantId: stock.variant,
      variantName: stock.variant_name,
      variantSku: stock.variant_sku,
      productName: stock.product_name,
      quantityRequested: 1,
      unitCost: parseFloat(stock.average_cost) || 0,
      availableQuantity: stock.available_quantity,
    };
    store.addItem(newItem);
  };

  // Update item quantity
  const handleUpdateQuantity = (variantId: number, delta: number) => {
    const index = store.items.findIndex((item) => item.variantId === variantId);
    if (index === -1) return;

    const item = store.items[index];
    const newQuantity = Math.max(
      1,
      Math.min(item.availableQuantity, item.quantityRequested + delta),
    );
    store.updateItem(index, { quantityRequested: newQuantity });
  };

  // Remove item
  const handleRemoveItem = (variantId: number) => {
    const index = store.items.findIndex((item) => item.variantId === variantId);
    if (index !== -1) {
      store.removeItem(index);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <Package className="w-12 h-12 text-gray-300" />
          <p className="text-secondary">
            {t("transfers.create.itemsStep.loading")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Added Items Summary */}
      {store.items.length > 0 && (
        <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <span className="font-semibold text-blue-800 dark:text-blue-200">
                {t("transfers.create.itemsStep.selectedItems")} (
                {store.items.length})
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => store.setItems([])}
              className="text-red-500 hover:text-red-700"
            >
              <Trash2 className="w-4 h-4 ml-1" />
              {t("transfers.create.itemsStep.clearAll")}
            </Button>
          </div>

          <div className="space-y-2 max-h-40 overflow-y-auto">
            {store.items.map((item) => (
              <div
                key={item.variantId}
                className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded-lg"
              >
                <div className="flex-1">
                  <p className="font-medium text-sm text-main">
                    {item.productName}
                  </p>
                  <p className="text-xs text-secondary">{item.variantSku}</p>
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => handleUpdateQuantity(item.variantId, -1)}
                    disabled={item.quantityRequested <= 1}
                  >
                    <Minus className="w-3 h-3" />
                  </Button>
                  <span className="w-8 text-center font-semibold text-main">
                    {item.quantityRequested}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => handleUpdateQuantity(item.variantId, 1)}
                    disabled={item.quantityRequested >= item.availableQuantity}
                  >
                    <Plus className="w-3 h-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-red-500"
                    onClick={() => handleRemoveItem(item.variantId)}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <Input
          placeholder={t("transfers.create.itemsStep.searchPlaceholder")}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pr-10"
        />
      </div>

      {/* Available Products */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {availableStocks?.map((stock) => {
          const isAdded = isItemAdded(stock.variant);
          const addedItem = getAddedItem(stock.variant);

          return (
            <div
              key={stock.id}
              className={`p-4 rounded-xl border-2 transition-all ${
                isAdded
                  ? "border-primary bg-primary/5"
                  : "border-gray-200 dark:border-gray-700 hover:border-primary/50"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-main">
                    {stock.product_name}
                  </h3>
                  <p className="text-sm text-secondary">{stock.variant_name}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    SKU: {stock.variant_sku}
                  </p>
                </div>

                <div className="text-left">
                  <div className="text-xl font-bold text-main">
                    {stock.available_quantity}
                  </div>
                  <p className="text-xs text-secondary">
                    {t("transfers.create.itemsStep.available")}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                {/* Stock Status */}
                {stock.stock_status === "Low Stock" && (
                  <div className="flex items-center gap-1 text-amber-600">
                    <AlertTriangle className="w-4 h-4" />
                    <span className="text-xs">
                      {t("transfers.create.itemsStep.lowStock")}
                    </span>
                  </div>
                )}
                {stock.stock_status !== "Low Stock" && <div />}

                {/* Add/Update Button */}
                {isAdded ? (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleUpdateQuantity(stock.variant, -1)}
                      disabled={addedItem && addedItem.quantityRequested <= 1}
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <span className="w-10 text-center font-bold text-primary">
                      {addedItem?.quantityRequested}
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleUpdateQuantity(stock.variant, 1)}
                      disabled={
                        addedItem &&
                        addedItem.quantityRequested >= stock.available_quantity
                      }
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-500"
                      onClick={() => handleRemoveItem(stock.variant)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => handleAddItem(stock)}
                    className="bg-primary hover:bg-primary/90"
                  >
                    <Plus className="w-4 h-4 ml-1" />
                    {t("transfers.create.itemsStep.add")}
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {availableStocks?.length === 0 && (
        <div className="text-center py-12">
          <Package className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-main mb-2">
            {searchQuery
              ? t("transfers.create.itemsStep.noResults")
              : t("transfers.create.itemsStep.noStock")}
          </h3>
          <p className="text-secondary">
            {searchQuery
              ? t("transfers.create.itemsStep.searchHint")
              : t("transfers.create.itemsStep.noStockHint")}
          </p>
        </div>
      )}
    </div>
  );
}

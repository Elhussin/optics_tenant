"use client";

import React, { useState, useMemo } from "react";
import {
  Warehouse,
  MapPin,
  Search,
  ArrowRight,
  AlertCircle,
  Package,
  Plus,
  Minus,
  Trash2,
  AlertTriangle,
  ShoppingCart,
  ChevronsUpDown,
  Check,
  Lock,
} from "lucide-react";
import { Input } from "@/src/shared/components/shadcn/ui/input";
import { Button } from "@/src/shared/components/shadcn/ui/button";
import { useTransferFormStore } from "../../../store";
import { TransferItem, Stock } from "../../../types";
import useSWR from "swr";
import api from "@/src/shared/api/axios";
import { extractArrayData } from "@/src/shared/utils/apiHelpers";
import { useTranslations } from "next-intl";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/src/shared/components/shadcn/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/src/shared/components/shadcn/ui/command";
import { cn } from "@/src/shared/utils/cn";

interface BranchesAndItemsStepProps {
  isEditMode?: boolean;
}

interface Branch {
  id: number;
  name: string;
  branch_code: string;
  branch_type: "store" | "branch";
  city: string;
  address: string;
}

export function BranchesAndItemsStep({
  isEditMode = false,
}: BranchesAndItemsStepProps) {
  const t = useTranslations("inventory");
  const store = useTransferFormStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [fromOpen, setFromOpen] = useState(false);
  const [toOpen, setToOpen] = useState(false);

  // Fetch all branches
  const { data: branches = [], isLoading: branchesLoading } = useSWR<Branch[]>(
    "branches_branches_list",
    async () => {
      const response = await api.customRequest("branches_branches_list", {});
      return extractArrayData<Branch>(response);
    },
    { revalidateOnFocus: false },
  );

  // Fetch stocks for the source branch
  const { data: stocks = [], isLoading: stocksLoading } = useSWR<Stock[]>(
    store.fromBranchId ? ["stocks_by_branch", store.fromBranchId] : null,
    async () => {
      const response = await api.customRequest("products_stocks_list", {
        branch: store.fromBranchId,
      });
      return extractArrayData<Stock>(response);
    },
    { revalidateOnFocus: false },
  );

  // Branch options for selects
  const branchOptions = useMemo(() => {
    if (!branches || !Array.isArray(branches)) return [];
    return branches.map((b) => ({
      value: b.id,
      label: b.name,
      type: b.branch_type,
      code: b.branch_code,
      city: b.city,
    }));
  }, [branches]);

  // Filter available stocks
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

  // Item management
  const isItemAdded = (variantId: number) =>
    store.items.some((item) => item.variantId === variantId);
  const getAddedItem = (variantId: number) =>
    store.items.find((item) => item.variantId === variantId);

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

  const handleRemoveItem = (variantId: number) => {
    const index = store.items.findIndex((item) => item.variantId === variantId);
    if (index !== -1) store.removeItem(index);
  };

  const handleFromBranchChange = (branchId: number) => {
    const branch = branches.find((b) => b.id === branchId);
    if (branch) {
      store.setFromBranch(branch.id, branch.name);
      if (store.items.length > 0) store.setItems([]);
    }
    setFromOpen(false);
  };

  const handleToBranchChange = (branchId: number) => {
    const branch = branches.find((b) => b.id === branchId);
    if (branch) store.setToBranch(branch.id, branch.name);
    setToOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Branch Selection Section */}
      <div className="p-6 bg-surface rounded-2xl border border-main/10">
        <h3 className="text-lg font-semibold text-main mb-4 flex items-center gap-2">
          <Warehouse className="w-5 h-5 text-primary" />
          {t("transfers.create.steps.branches")}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          {/* From Branch */}
          <div>
            <label className="block text-sm font-medium text-secondary mb-2">
              {t("transfers.create.branchesStep.fromBranch")} *
              {isEditMode && (
                <Lock className="w-3 h-3 inline ml-1 text-gray-400" />
              )}
            </label>
            {isEditMode ? (
              // Read-only display in edit mode
              <div className="w-full h-12 px-4 flex items-center gap-2 rounded-xl bg-gray-100 dark:bg-gray-800 border border-main/10">
                <Warehouse className="w-4 h-4 text-red-500" />
                <span className="font-medium text-main">
                  {store.fromBranchName}
                </span>
              </div>
            ) : (
              <Popover open={fromOpen} onOpenChange={setFromOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    className={cn(
                      "w-full justify-between h-12 px-4 font-normal rounded-xl bg-body border border-main/20",
                      fromOpen && "border-primary ring-2 ring-primary/20",
                    )}
                  >
                    {store.fromBranchName ? (
                      <div className="flex items-center gap-2">
                        <Warehouse className="w-4 h-4 text-red-500" />
                        <span className="font-medium">
                          {store.fromBranchName}
                        </span>
                      </div>
                    ) : (
                      <span className="text-secondary">
                        {t("transfers.create.branchesStep.selectSender")}
                      </span>
                    )}
                    <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[300px] p-0 bg-surface border border-main/20">
                  <Command className="bg-surface">
                    <CommandInput
                      placeholder={t(
                        "transfers.create.branchesStep.searchPlaceholder",
                      )}
                    />
                    <CommandList className="max-h-60">
                      <CommandEmpty>
                        {t("transfers.create.branchesStep.noResults")}
                      </CommandEmpty>
                      <CommandGroup>
                        {branchOptions
                          .filter((b) => b.value !== store.toBranchId)
                          .map((branch) => (
                            <CommandItem
                              key={branch.value}
                              value={branch.label}
                              onSelect={() =>
                                handleFromBranchChange(branch.value)
                              }
                              className="cursor-pointer px-4 py-2.5"
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  store.fromBranchId === branch.value
                                    ? "opacity-100"
                                    : "opacity-0",
                                )}
                              />
                              <div>
                                <span className="font-medium">
                                  {branch.label}
                                </span>
                                <span className="text-xs text-secondary ml-2">
                                  {branch.code}
                                </span>
                              </div>
                            </CommandItem>
                          ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            )}
          </div>

          {/* Arrow */}
          <div className="flex justify-center">
            <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <ArrowRight className="w-5 h-5 text-gray-500 rotate-180" />
            </div>
          </div>

          {/* To Branch */}
          <div>
            <label className="block text-sm font-medium text-secondary mb-2">
              {t("transfers.create.branchesStep.toBranch")} *
              {isEditMode && (
                <Lock className="w-3 h-3 inline ml-1 text-gray-400" />
              )}
            </label>
            {isEditMode ? (
              // Read-only display in edit mode
              <div className="w-full h-12 px-4 flex items-center gap-2 rounded-xl bg-gray-100 dark:bg-gray-800 border border-main/10">
                <Warehouse className="w-4 h-4 text-green-500" />
                <span className="font-medium text-main">
                  {store.toBranchName}
                </span>
              </div>
            ) : (
              <Popover open={toOpen} onOpenChange={setToOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    className={cn(
                      "w-full justify-between h-12 px-4 font-normal rounded-xl bg-body border border-main/20",
                      toOpen && "border-primary ring-2 ring-primary/20",
                    )}
                  >
                    {store.toBranchName ? (
                      <div className="flex items-center gap-2">
                        <Warehouse className="w-4 h-4 text-green-500" />
                        <span className="font-medium">
                          {store.toBranchName}
                        </span>
                      </div>
                    ) : (
                      <span className="text-secondary">
                        {t("transfers.create.branchesStep.selectReceiver")}
                      </span>
                    )}
                    <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[300px] p-0 bg-surface border border-main/20">
                  <Command className="bg-surface">
                    <CommandInput
                      placeholder={t(
                        "transfers.create.branchesStep.searchPlaceholder",
                      )}
                    />
                    <CommandList className="max-h-60">
                      <CommandEmpty>
                        {t("transfers.create.branchesStep.noResults")}
                      </CommandEmpty>
                      <CommandGroup>
                        {branchOptions
                          .filter((b) => b.value !== store.fromBranchId)
                          .map((branch) => (
                            <CommandItem
                              key={branch.value}
                              value={branch.label}
                              onSelect={() =>
                                handleToBranchChange(branch.value)
                              }
                              className="cursor-pointer px-4 py-2.5"
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  store.toBranchId === branch.value
                                    ? "opacity-100"
                                    : "opacity-0",
                                )}
                              />
                              <div>
                                <span className="font-medium">
                                  {branch.label}
                                </span>
                                <span className="text-xs text-secondary ml-2">
                                  {branch.code}
                                </span>
                              </div>
                            </CommandItem>
                          ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            )}
          </div>
        </div>

        {/* Same branch warning */}
        {store.fromBranchId &&
          store.toBranchId &&
          store.fromBranchId === store.toBranchId && (
            <div className="mt-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-500" />
              <span className="text-sm text-red-700 dark:text-red-300">
                {t("transfers.create.branchesStep.sameBranchError")}
              </span>
            </div>
          )}
      </div>

      {/* Items Section - Only show when fromBranch is selected */}
      {store.fromBranchId && (
        <div className="p-6 bg-surface rounded-2xl border border-main/10">
          <h3 className="text-lg font-semibold text-main mb-4 flex items-center gap-2">
            <Package className="w-5 h-5 text-primary" />
            {t("transfers.create.steps.items")}
          </h3>

          {/* Added Items Summary */}
          {store.items.length > 0 && (
            <div className="mb-4 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
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
                      <p className="text-xs text-secondary">
                        {item.variantSku}
                      </p>
                    </div>
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
                        disabled={
                          item.quantityRequested >= item.availableQuantity
                        }
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
          <div className="relative mb-4">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              placeholder={t("transfers.create.itemsStep.searchPlaceholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-10"
            />
          </div>

          {/* Loading */}
          {stocksLoading && (
            <div className="flex justify-center items-center py-8">
              <div className="animate-pulse flex flex-col items-center gap-4">
                <Package className="w-12 h-12 text-gray-300" />
                <p className="text-secondary">
                  {t("transfers.create.itemsStep.loading")}
                </p>
              </div>
            </div>
          )}

          {/* Available Products */}
          {!stocksLoading && (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {availableStocks.map((stock) => {
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
                        <p className="text-sm text-secondary">
                          {stock.variant_name}
                        </p>
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

                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                      {stock.stock_status === "Low Stock" ? (
                        <div className="flex items-center gap-1 text-amber-600">
                          <AlertTriangle className="w-4 h-4" />
                          <span className="text-xs">
                            {t("transfers.create.itemsStep.lowStock")}
                          </span>
                        </div>
                      ) : (
                        <div />
                      )}

                      {isAdded ? (
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() =>
                              handleUpdateQuantity(stock.variant, -1)
                            }
                            disabled={
                              addedItem && addedItem.quantityRequested <= 1
                            }
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
                            onClick={() =>
                              handleUpdateQuantity(stock.variant, 1)
                            }
                            disabled={
                              addedItem &&
                              addedItem.quantityRequested >=
                                stock.available_quantity
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
          )}

          {/* Empty State */}
          {!stocksLoading && availableStocks.length === 0 && (
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
      )}

      {/* Prompt to select branch */}
      {!store.fromBranchId && (
        <div className="text-center py-8 text-secondary">
          <Warehouse className="w-12 h-12 mx-auto mb-4 opacity-40" />
          <p>
            {t("transfers.create.itemsStep.selectBranchFirst") ||
              "Select source branch first to see available items"}
          </p>
        </div>
      )}
    </div>
  );
}

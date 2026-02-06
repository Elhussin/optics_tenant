"use client";

import React, { useState, useMemo } from "react";
import {
  Package,
  Warehouse,
  Search,
  Filter,
  RefreshCw,
  Eye,
  Loader2,
  ArrowLeftRight,
  Plus,
} from "lucide-react";
import { Button } from "@/src/shared/components/shadcn/ui/button";
import { Input } from "@/src/shared/components/shadcn/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/shared/components/shadcn/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/shared/components/shadcn/ui/select";
import { Badge } from "@/src/shared/components/shadcn/ui/badge";
import Link from "next/link";
import useSWR from "swr";
import api from "@/src/shared/api/axios";
import { Stock } from "@/src/features/stock-management/types";
import { extractArrayData } from "@/src/shared/utils/apiHelpers";
import { useTranslations } from "next-intl";
import { featuresConfig } from "@/src/shared/constants/entityConfig";

interface StockListCardProps {
  // Optional: filter by branch
  branchId?: number;
  // Optional: filter by status
  defaultStatus?: "all" | "in_stock" | "low" | "out";
  // Optional: show/hide filters
  showFilters?: boolean;
  // Optional: show/hide search
  showSearch?: boolean;
  // Optional: custom title
  title?: string;
  // Optional: compact mode (less padding)
  compact?: boolean;
  // Optional: max items to show
  maxItems?: number;
  // Optional: custom link base
  linkBase?: string;
  // Optional: show only stores (filter out non-store branches)
  onlyStores?: boolean;
}

export function StockListCard({
  branchId,
  defaultStatus = "all",
  showFilters = true,
  showSearch = true,
  title,
  compact = false,
  maxItems,
  linkBase = "/dashboard/stock-management/stocks",
  onlyStores = false,
}: StockListCardProps) {
  const t = useTranslations("inventory");
  const [searchQuery, setSearchQuery] = useState("");
  const [stockFilter, setStockFilter] = useState<string>(defaultStatus);
  const [branchFilter, setBranchFilter] = useState<string>(
    branchId ? branchId.toString() : "all",
  );

  // Fetch stocks
  const {
    data: stocks = [],
    isLoading,
    mutate: refreshStocks,
  } = useSWR<Stock[]>(
    featuresConfig.stocks.listAlias!,
    async () => {
      const response = await api.customRequest(
        featuresConfig.stocks.listAlias!,
        {},
      );
      return extractArrayData<Stock>(response);
    },
    { revalidateOnFocus: false },
  );

    console.log("Stocks",stocks);
  // Filter stocks
  const filteredStocks = useMemo(() => {
    if (!stocks || !Array.isArray(stocks)) return [];

    let result = stocks.filter((stock) => {
      // Filter by store type if onlyStores is true
      const matchesStoreType = !onlyStores || stock.branch_type === "store";

      const matchesSearch =
        !searchQuery ||
        stock.variant_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        stock.variant_sku?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        stock.product_name?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStockFilter =
        stockFilter === "all" ||
        (stockFilter === "in_stock" && stock.stock_status === "In Stock") ||
        (stockFilter === "low" && stock.stock_status === "Low Stock") ||
        (stockFilter === "out" && stock.stock_status === "Out of Stock");

      const matchesBranch =
        branchFilter === "all" || stock.branch?.toString() === branchFilter;

      return (
        matchesStoreType && matchesSearch && matchesStockFilter && matchesBranch
      );
    });

    // Apply max items limit if set
    if (maxItems && result.length > maxItems) {
      result = result.slice(0, maxItems);
    }

    return result;
  }, [stocks, searchQuery, stockFilter, branchFilter, maxItems, onlyStores]);

  // Get unique branches from stocks (filter by store type if onlyStores)
  const uniqueBranches = useMemo(() => {
    if (!stocks || !Array.isArray(stocks)) return [];

    const branchMap = new Map<
      number,
      { id: number; name: string; branch_type?: string }
    >();
    stocks.forEach((s) => {
      // Skip non-store branches if onlyStores is true
      if (onlyStores && s.branch_type !== "store") return;

      if (s.branch && !branchMap.has(s.branch)) {
        branchMap.set(s.branch, {
          id: s.branch,
          name: s.branch_name || `${t("stocks.branchPrefix")} ${s.branch}`,
          branch_type: s.branch_type,
        });
      }
    });
    return Array.from(branchMap.values());
  }, [stocks, t, onlyStores]);

  const getStockStatusBadge = (status: string) => {
    switch (status) {
      case "In Stock":
        return (
          <Badge className="bg-green-100 text-green-700 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400">
            {t("status.inStock")}
          </Badge>
        );
      case "Low Stock":
        return (
          <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400">
            {t("status.lowStock")}
          </Badge>
        );
      case "Out of Stock":
        return (
          <Badge className="bg-red-100 text-red-700 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400">
            {t("status.outOfStock")}
          </Badge>
        );
      case "Overstocked":
        return (
          <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400">
            {t("status.overstocked")}
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-main flex items-center gap-3">
            <Package className="w-8 h-8 text-primary" />
            {t("title")}
          </h1>
          <p className="text-secondary mt-1">{t("subtitle")}</p>
        </div>

        <div className="flex gap-3 mt-4 md:mt-0">
          <Link href="/dashboard/stock-management/transfers/create">
            <Button variant="outline" className="gap-2">
              <ArrowLeftRight className="w-4 h-4" />
              {t("transferStock")}
            </Button>
          </Link>
          <Link href="/dashboard/stock-management/stocks/create">
            <Button className="gap-2 bg-primary/20 hover:bg-primary/90">
              <Plus className="w-4 h-4" />
              {t("addMovement")}
            </Button>
          </Link>
          <Link href="/dashboard/stock-management/purchase-orders/create">
            <Button className="gap-2 bg-primary/20 hover:bg-primary/90">
              <Plus className="w-4 h-4" />
              {t("purchaseOrders.title")}
            </Button>
          </Link>
        </div>
      </div>

      <Card>
        <CardHeader className={compact ? "pb-3" : ""}>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <CardTitle>{title || t("stocks.title")}</CardTitle>

            {(showFilters || showSearch) && (
              <div className="flex flex-wrap gap-3">
                {/* Search */}
                {showSearch && (
                  <div className="relative">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder={t("stocks.searchPlaceholder")}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pr-9 w-48"
                    />
                  </div>
                )}

                {showFilters && (
                  <>
                    {/* Stock Filter */}
                    <Select value={stockFilter} onValueChange={setStockFilter}>
                      <SelectTrigger className="w-36">
                        <Filter className="w-4 h-4 ml-2" />
                        <SelectValue placeholder={t("stocks.filters.status")} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">
                          {t("stocks.filters.all")}
                        </SelectItem>
                        <SelectItem value="in_stock">
                          {t("stocks.filters.inStock")}
                        </SelectItem>
                        <SelectItem value="low">
                          {t("stocks.filters.low")}
                        </SelectItem>
                        <SelectItem value="out">
                          {t("stocks.filters.out")}
                        </SelectItem>
                      </SelectContent>
                    </Select>

                    {/* Branch Filter - only show if no branchId prop */}
                    {!branchId && (
                      <Select
                        value={branchFilter}
                        onValueChange={setBranchFilter}
                      >
                        <SelectTrigger className="w-40">
                          <Warehouse className="w-4 h-4 ml-2" />
                          <SelectValue
                            placeholder={t("stocks.filters.branch")}
                          />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">
                            {t("stocks.filters.allBranches")}
                          </SelectItem>
                          {uniqueBranches.map((branch) => (
                            <SelectItem
                              key={branch.id}
                              value={branch.id.toString()}
                            >
                              {branch.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </>
                )}

                {/* Refresh */}
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => refreshStocks()}
                >
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className={compact ? "pt-0" : ""}>
          {isLoading ? (
            <div className="text-center py-12 text-secondary flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              {t("stocks.loading")}
            </div>
          ) : filteredStocks?.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <p className="text-secondary">{t("stocks.noResults")}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-right py-3 px-4 text-sm font-medium text-secondary">
                      {t("stocks.table.product")}
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-secondary">
                      {t("stocks.table.branch")}
                    </th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-secondary">
                      {t("stocks.table.available")}
                    </th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-secondary">
                      {t("stocks.table.reserved")}
                    </th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-secondary">
                      {t("stocks.table.status")}
                    </th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-secondary">
                      {t("stocks.table.actions")}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStocks?.map((stock) => (
                    <tr
                      key={stock.id}
                      className="border-b hover:bg-gray-50 dark:hover:bg-gray-800/50"
                    >
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium text-main">
                            {stock.product_name}
                          </p>
                          <p className="text-xs text-secondary">
                            {stock.variant_sku}
                          </p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Warehouse className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-main">
                            {stock.branch_name}
                          </span>
                        </div>
                      </td>
                      <td className="text-center py-3 px-4">
                        <span className="font-bold text-lg text-main">
                          {stock.available_quantity}
                        </span>
                      </td>
                      <td className="text-center py-3 px-4">
                        <span className="text-secondary">
                          {stock.reserved_quantity}
                        </span>
                      </td>
                      <td className="text-center py-3 px-4">
                        {getStockStatusBadge(stock.stock_status)}
                      </td>
                      <td className="text-center py-3 px-4">
                        <Link href={`${linkBase}/${stock.id}`}>
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}

export default StockListCard;

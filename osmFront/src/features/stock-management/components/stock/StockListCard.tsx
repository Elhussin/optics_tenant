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
import { formsConfig } from "@/src/shared/constants/formsConfig";

import { useFilteredListRequest } from "@/src/shared/hooks/useFilteredListRequest";
import { Pagination } from "@/src/shared/components/views/Pagination";

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

  // Initialize hook with default values
  const {
    data: stocks,
    count,
    page,
    setPage,
    setFilters,
    isLoading,
    page_size,
    setPageSize,
    totalPages,
    refetch,
  } = useFilteredListRequest({
    alias: formsConfig.stocks.listAlias!,
    defaultPageSize: maxItems,
  });

  // Local state for UI controls (synced with hook via setFilters)
  const [searchQuery, setSearchQuery] = useState("");
  const [stockFilter, setStockFilter] = useState<string>(defaultStatus);
  const [branchFilter, setBranchFilter] = useState<string>(
    branchId ? branchId.toString() : "all",
  );

  // Apply filters when UI controls change
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    setFilters({ search: value });
  };

  const handleStockFilterChange = (value: string) => {
    setStockFilter(value);
    // Map UI values to backend expected values if needed, or pass as is
    // Assuming backend takes 'stock_status' or similar if implemented,
    // or we might need to rely on client side if backend doesn't support complex status filtering yet.
    // For now passing it as 'status' param.
    setFilters({ status: value === "all" ? "" : value });
  };

  const handleBranchFilterChange = (value: string) => {
    setBranchFilter(value);
    setFilters({ branch: value === "all" ? "" : value });
  };

  // Sync props with hook on mount if needed
  React.useEffect(() => {
    if (branchId) {
      setFilters({ branch: branchId.toString() });
    }
    if (defaultStatus !== "all") {
      setFilters({ status: defaultStatus });
    }
  }, [branchId, defaultStatus]);

  // Fetch branches for filter (Keep this independent)
  const { data: branchesData = [] } = useSWR(
    formsConfig.branches.listAlias,
    async () => {
      const response = await api.customRequest(
        formsConfig.branches.listAlias!,
        {},
      );
      return extractArrayData<{
        id: number;
        name: string;
        branch_type: string;
      }>(response);
    },
    { revalidateOnFocus: false },
  );

  // Get branches for filter
  const branchOptions = useMemo(() => {
    if (!branchesData) return [];

    return branchesData.filter((b) => {
      if (onlyStores && b.branch_type !== "store") return false;
      return true;
    });
  }, [branchesData, onlyStores]);

  const getStockStatusBadge = (status: string) => {
    switch (status) {
      case "In Stock":
        return (
          <Badge className="bg-success/10 text-success hover:bg-success/20 border-success/20">
            {t("status.inStock")}
          </Badge>
        );
      case "Low Stock":
        return (
          <Badge className="bg-warning/10 text-warning hover:bg-warning/20 border-warning/20">
            {t("status.lowStock")}
          </Badge>
        );
      case "Out of Stock":
        return (
          <Badge className="bg-danger/10 text-danger hover:bg-danger/20 border-danger/20">
            {t("status.outOfStock")}
          </Badge>
        );
      case "Overstocked":
        return (
          <Badge className="bg-primary/10 text-info hover:bg-info/20 border-info/20">
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
                      onChange={handleSearch}
                      className="pr-9 w-48"
                    />
                  </div>
                )}

                {showFilters && (
                  <>
                    {/* Stock Filter */}
                    <Select
                      value={stockFilter}
                      onValueChange={handleStockFilterChange}
                    >
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
                        onValueChange={handleBranchFilterChange}
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
                          {branchOptions.map((branch) => (
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
                <Button variant="outline" size="icon" onClick={() => refetch()}>
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
          ) : !stocks || stocks.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <p className="text-secondary">{t("stocks.noResults")}</p>
            </div>
          ) : (
            <>
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
                    {stocks.map((stock: any) => (
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

              {/* Pagination */}
              {!maxItems && (
                <Pagination
                  page={page}
                  totalPages={totalPages}
                  onPageChange={setPage}
                  pageSize={page_size}
                  onPageSizeChange={setPageSize}
                />
              )}
            </>
          )}
        </CardContent>
      </Card>
    </>
  );
}

export default StockListCard;

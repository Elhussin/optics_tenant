"use client";

import React, { useState, useMemo } from "react";
import {
  Package,
  Plus,
  ArrowLeftRight,
  AlertTriangle,
  Warehouse,
  Search,
  Filter,
  RefreshCw,
  Eye,
  Truck,
} from "lucide-react";
import { Button } from "@/src/shared/components/shadcn/ui/button";
import { Input } from "@/src/shared/components/shadcn/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/src/shared/components/shadcn/ui/tabs";
import { Badge } from "@/src/shared/components/shadcn/ui/badge";
import Link from "next/link";
import useSWR from "swr";
import api from "@/src/shared/api/axios";
import { Stock, StockTransfer } from "@/src/features/stock-management/types";
import { extractArrayData } from "@/src/shared/utils/apiHelpers";
import { useTranslations } from "next-intl";
import { featuresConfig } from "@/src/shared/constants/entityConfig";
import { PurchaseOrderList } from "../purchase-orders";

export default function InventoryList() {
  const t = useTranslations("inventory");
  const [searchQuery, setSearchQuery] = useState("");
  const [stockFilter, setStockFilter] = useState<string>("all");
  const [branchFilter, setBranchFilter] = useState<string>("all");

  // Fetch stocks - with extractArrayData to handle paginated responses
  const {
    data: stocks = [],
    isLoading: stocksLoading,
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

  // Fetch pending transfers
  const { data: pendingTransfers = [] } = useSWR<StockTransfer[]>(
    featuresConfig["product-stock-transfers"].listAlias!,
    async () => {
      const response = await api.customRequest(
        featuresConfig["product-stock-transfers"].listAlias!,
        { status: "pending" },
      );
      return extractArrayData<StockTransfer>(response);
    },
    { revalidateOnFocus: false },
  );

  // Fetch low stock
  const { data: lowStockItems = [] } = useSWR<Stock[]>(
    featuresConfig["products-stocks-low-stock"].listAlias!,
    async () => {
      const response = await api.customRequest(
        featuresConfig["products-stocks-low-stock"].listAlias!,
        {},
      );
      return extractArrayData<Stock>(response);
    },
    { revalidateOnFocus: false },
  );

  // Filter stocks - with useMemo for performance
  const filteredStocks = useMemo(() => {
    if (!stocks || !Array.isArray(stocks)) return [];

    return stocks.filter((stock) => {
      const matchesSearch =
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

      return matchesSearch && matchesStockFilter && matchesBranch;
    });
  }, [stocks, searchQuery, stockFilter, branchFilter]);

  // Get unique branches - with useMemo and safe checks
  const uniqueBranches = useMemo(() => {
    if (!stocks || !Array.isArray(stocks)) return [];

    const branchMap = new Map<number, { id: number; name: string }>();
    stocks.forEach((s) => {
      if (s.branch && !branchMap.has(s.branch)) {
        branchMap.set(s.branch, {
          id: s.branch,
          name: s.branch_name || `${t("stocks.branchPrefix")} ${s.branch}`,
        });
      }
    });
    return Array.from(branchMap.values());
  }, [stocks]);

  const getStockStatusBadge = (status: string) => {
    switch (status) {
      case "In Stock":
        return (
          <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
            {t("status.inStock")}
          </Badge>
        );
      case "Low Stock":
        return (
          <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">
            {t("status.lowStock")}
          </Badge>
        );
      case "Out of Stock":
        return (
          <Badge className="bg-red-100 text-red-700 hover:bg-red-100">
            {t("status.outOfStock")}
          </Badge>
        );
      case "Overstocked":
        return (
          <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">
            {t("status.overstocked")}
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  // Stats
  const totalItems = stocks?.length || 0;
  const lowStockCount = lowStockItems?.length || 0;
  const outOfStockCount =
    stocks?.filter((s) => s.stock_status === "Out of Stock").length || 0;
  const pendingTransfersCount = pendingTransfers?.length || 0;

  return (
    <div className="min-h-screen bg-body py-8">
      <div className="container mx-auto px-4">
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
            <Link href="/dashboard/stock-management/add">
              <Button className="gap-2 bg-primary hover:bg-primary/90">
                <Plus className="w-4 h-4" />
                {t("addMovement")}
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-secondary">
                    {t("stats.totalItems")}
                  </p>
                  <p className="text-3xl font-bold text-main">{totalItems}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <Package className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card
            className={
              lowStockCount > 0 ? "border-amber-300 dark:border-amber-700" : ""
            }
          >
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-secondary">
                    {t("stats.lowStock")}
                  </p>
                  <p className="text-3xl font-bold text-amber-600">
                    {lowStockCount}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card
            className={
              outOfStockCount > 0 ? "border-red-300 dark:border-red-700" : ""
            }
          >
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-secondary">
                    {t("stats.outOfStock")}
                  </p>
                  <p className="text-3xl font-bold text-red-600">
                    {outOfStockCount}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                  <Package className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-secondary">
                    {t("stats.pendingTransfers")}
                  </p>
                  <p className="text-3xl font-bold text-indigo-600">
                    {pendingTransfersCount}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                  <ArrowLeftRight className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="stocks" className="space-y-4">
          <TabsList>
            <TabsTrigger value="stocks" className="gap-2">
              <Package className="w-4 h-4" />
              {t("tabs.stocks")}
            </TabsTrigger>
            <TabsTrigger value="transfers" className="gap-2">
              <ArrowLeftRight className="w-4 h-4" />
              {t("tabs.transfers")}
              {pendingTransfersCount > 0 && (
                <Badge className="ml-2 bg-primary">
                  {pendingTransfersCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="purchase-orders" className="gap-2">
              <Truck className="w-4 h-4" />
              {t("tabs.purchaseOrders")}
            </TabsTrigger>
          </TabsList>

          {/* Stocks Tab */}
          <TabsContent value="stocks">
            <Card>
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <CardTitle>{t("stocks.title")}</CardTitle>

                  <div className="flex flex-wrap gap-3">
                    {/* Search */}
                    <div className="relative">
                      <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        placeholder={t("stocks.searchPlaceholder")}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pr-9 w-48"
                      />
                    </div>

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

                    {/* Branch Filter */}
                    <Select
                      value={branchFilter}
                      onValueChange={setBranchFilter}
                    >
                      <SelectTrigger className="w-40">
                        <Warehouse className="w-4 h-4 ml-2" />
                        <SelectValue placeholder={t("stocks.filters.branch")} />
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

                    {/* Refresh */}
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => refreshStocks()}
                    >
                      <RefreshCw className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                {stocksLoading ? (
                  <div className="text-center py-12 text-secondary">
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
                              <Link
                                href={`/dashboard/stock-management/stocks/${stock.id}`}
                              >
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
          </TabsContent>

          {/* Transfers Tab */}
          <TabsContent value="transfers">
            <Card>
              <CardHeader>
                <CardTitle>{t("transfers.title")}</CardTitle>
                <CardDescription>{t("transfers.description")}</CardDescription>
              </CardHeader>
              <CardContent>
                {pendingTransfers?.length === 0 ? (
                  <div className="text-center py-12">
                    <ArrowLeftRight className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                    <p className="text-secondary mb-4">
                      {t("transfers.noTransfers")}
                    </p>
                    <Link href="/dashboard/stock-management/transfers/create">
                      <Button className="gap-2">
                        <Plus className="w-4 h-4" />
                        {t("transfers.newTransfer")}
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {pendingTransfers?.map((transfer) => (
                      <div
                        key={transfer.id}
                        className="p-4 rounded-xl border hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold text-main">
                              {transfer.transfer_number}
                            </p>
                            <p className="text-sm text-secondary">
                              {transfer.from_branch_name} ←{" "}
                              {transfer.to_branch_name}
                            </p>
                          </div>
                          <Badge variant="outline">
                            {transfer.status_display}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Purchase Orders Tab */}
          <TabsContent value="purchase-orders">
            <PurchaseOrderList />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

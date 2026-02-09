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
import { formsConfig } from "@/src/shared/constants/formsConfig";
import { PurchaseOrderList } from "../../purchase-orders";
import { StockListCard } from "../StockListCard";

export default function StockListView() {
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
    formsConfig.stocks.listAlias!,
    async () => {
      const response = await api.customRequest(
        formsConfig.stocks.listAlias!,
        {},
      );
      return extractArrayData<Stock>(response);
    },
    { revalidateOnFocus: false },
  );

  // Fetch pending transfers
  const { data: pendingTransfers = [] } = useSWR<StockTransfer[]>(
    formsConfig["product-stock-transfers"].listAlias!,
    async () => {
      const response = await api.customRequest(
        formsConfig["product-stock-transfers"].listAlias!,
        { status: "pending" },
      );
      return extractArrayData<StockTransfer>(response);
    },
    { revalidateOnFocus: false },
  );

  // Fetch low stock
  const { data: lowStockItems = [] } = useSWR<Stock[]>(
    formsConfig["products-stocks-low-stock"].listAlias!,
    async () => {
      const response = await api.customRequest(
        formsConfig["products-stocks-low-stock"].listAlias!,
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
            <StockListCard />
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

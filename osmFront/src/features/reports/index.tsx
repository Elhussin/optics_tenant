"use client";
// features/reports/index.ts
/**
 * Reports Module Exports
 */

// Types
export * from './types/reports.types';

// Hooks
export * from './hooks/useReports';

// Components
export { StatCard, SummaryStats, ReportSection, PercentageBar } from './components/ReportCard';
export { BarChart, LineChart, DonutChart } from './components/ReportChart';
export { DateRangePicker } from './components/DateRangePicker';

// Pages
export { ReportsDashboard } from './pages/ReportsDashboard';
export { SalesReportPage } from './pages/SalesReportPage';
export { ReceivablesReportPage } from './pages/ReceivablesReportPage';

import React, { useState } from "react";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Package,
  ShoppingCart,
  Clock,
  AlertTriangle,
  RefreshCw,
  Calendar,
  Building2,
  CreditCard,
  Banknote,
  ArrowUpRight,
  ArrowDownRight,
  PieChart,
  Receipt,
} from "lucide-react";
import { Button } from "@/src/shared/components/shadcn/ui/button";
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
import { useQuery } from "@tanstack/react-query";
import api from "@/src/shared/api/axios";

// Types
interface FinancialDashboard {
  period: string;
  from_date: string;
  sales: {
    invoices_count: number;
    gross_total: number;
    tax_collected: number;
    discounts_given: number;
    net_total: number;
    amount_received: number;
    pending_amount: number;
  };
  purchases: {
    invoices_count: number;
    total: number;
    paid: number;
  };
  returns: {
    count: number;
    total: number;
  };
  payments: {
    total: number;
    by_method: {
      cash: number;
      card: number;
    };
  };
  reserved_inventory: {
    quantity: number;
    estimated_value: number;
  };
}

interface AgingData {
  aging: {
    current: { days: string; count: number; amount: number };
    days_31_60: { days: string; count: number; amount: number };
    days_61_90: { days: string; count: number; amount: number };
    over_90: { days: string; count: number; amount: number };
  };
  total_pending: number;
  invoices_count: number;
}

interface PendingOrders {
  by_status: Array<{
    status: string;
    count: number;
    total_value: number;
    paid_amount: number;
  }>;
  total: {
    count: number;
    total_value: number;
    reserved_items: number;
  };
}

interface TopProduct {
  product_variant_id: number;
  product_name: string;
  variant_name: string;
  total_sold: number;
  total_revenue: number;
}

interface BranchComparison {
  branch_id: number;
  branch_name: string;
  orders_count: number;
  total_revenue: number;
  avg_order: number;
}

export default function ReportsPage() {
  const [period, setPeriod] = useState("month");
  const [branchId, setBranchId] = useState<string>("all");

  // Fetch financial dashboard
  const {
    data: financial,
    isLoading: financialLoading,
    refetch: refreshFinancial,
  } = useQuery<FinancialDashboard>({
    queryKey: ["financial-dashboard", period, branchId],
    queryFn: async () => {
      const params: Record<string, string> = { period };
      if (branchId !== "all") params.branch_id = branchId;
      return api.customRequest("sales_reports_financial-dashboard", params);
    },
    refetchOnWindowFocus: false,
  });

  // Fetch receivables aging
  const { data: aging } = useQuery<AgingData>({
    queryKey: ["receivables-aging", branchId],
    queryFn: async () => {
      const params: Record<string, string> = {};
      if (branchId !== "all") params.branch_id = branchId;
      return api.customRequest("sales_reports_receivables-aging", params);
    },
    refetchOnWindowFocus: false,
  });

  // Fetch pending orders
  const { data: pendingOrders } = useQuery<PendingOrders>({
    queryKey: ["pending-orders", branchId],
    queryFn: async () => {
      const params: Record<string, string> = {};
      if (branchId !== "all") params.branch_id = branchId;
      return api.customRequest("sales_reports_pending-orders", params);
    },
    refetchOnWindowFocus: false,
  });

  // Fetch top products
  const { data: topProducts } = useQuery<TopProduct[]>({
    queryKey: ["top-products", period, branchId],
    queryFn: async () => {
      const params: Record<string, string> = {
        days: period === "week" ? "7" : period === "month" ? "30" : "365",
      };
      if (branchId !== "all") params.branch_id = branchId;
      const response = await api.customRequest(
        "sales_reports_top-products",
        params
      );
      return Array.isArray(response) ? response : response?.results || [];
    },
    refetchOnWindowFocus: false,
  });

  // Fetch branch comparison
  const { data: branchComparison } = useQuery<BranchComparison[]>({
    queryKey: ["branch-comparison", period],
    queryFn: async () => {
      const params = {
        days: period === "week" ? "7" : period === "month" ? "30" : "365",
      };
      const response = await api.customRequest(
        "sales_reports_branch-comparison",
        params
      );
      return Array.isArray(response) ? response : response?.results || [];
    },
    refetchOnWindowFocus: false,
  });

  const formatCurrency = (amount: number | undefined) => {
    if (!amount) return "0.00";
    return new Intl.NumberFormat("ar-SA", {
      style: "currency",
      currency: "SAR",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatNumber = (num: number | undefined) => {
    if (!num) return "0";
    return new Intl.NumberFormat("ar-SA").format(num);
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: "قيد الانتظار",
      confirmed: "مؤكد",
      ready: "جاهز للتسليم",
    };
    return labels[status] || status;
  };

  const periodLabels: Record<string, string> = {
    today: "اليوم",
    week: "هذا الأسبوع",
    month: "هذا الشهر",
    year: "هذه السنة",
  };

  return (
    <div className="min-h-screen bg-body py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-main flex items-center gap-3">
              <BarChart3 className="w-8 h-8 text-primary" />
              التقارير والإحصائيات
            </h1>
            <p className="text-secondary mt-1">
              نظرة شاملة على أداء المبيعات والمخزون
            </p>
          </div>

          <div className="flex gap-3 mt-4 md:mt-0">
            {/* Period Selector */}
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-40">
                <Calendar className="w-4 h-4 ml-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">اليوم</SelectItem>
                <SelectItem value="week">هذا الأسبوع</SelectItem>
                <SelectItem value="month">هذا الشهر</SelectItem>
                <SelectItem value="year">هذه السنة</SelectItem>
              </SelectContent>
            </Select>

            {/* Refresh */}
            <Button
              variant="outline"
              size="icon"
              onClick={() => refreshFinancial()}
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Main Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Total Revenue */}
          <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-100 text-sm">إجمالي المبيعات</p>
                  <p className="text-3xl font-bold mt-1">
                    {formatCurrency(financial?.sales?.net_total)}
                  </p>
                  <p className="text-emerald-200 text-xs mt-2">
                    {financial?.sales?.invoices_count || 0} فاتورة
                  </p>
                </div>
                <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center">
                  <DollarSign className="w-7 h-7" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Amount Received */}
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">المبالغ المحصلة</p>
                  <p className="text-3xl font-bold mt-1">
                    {formatCurrency(financial?.payments?.total)}
                  </p>
                  <div className="flex gap-3 mt-2 text-xs">
                    <span className="flex items-center gap-1">
                      <Banknote className="w-3 h-3" />
                      {formatCurrency(financial?.payments?.by_method?.cash)}
                    </span>
                    <span className="flex items-center gap-1">
                      <CreditCard className="w-3 h-3" />
                      {formatCurrency(financial?.payments?.by_method?.card)}
                    </span>
                  </div>
                </div>
                <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center">
                  <TrendingUp className="w-7 h-7" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pending Amount */}
          <Card
            className={`${
              (financial?.sales?.pending_amount || 0) > 0
                ? "bg-gradient-to-br from-amber-500 to-orange-500"
                : "bg-gradient-to-br from-gray-500 to-gray-600"
            } text-white border-0`}
          >
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-amber-100 text-sm">مبالغ معلقة</p>
                  <p className="text-3xl font-bold mt-1">
                    {formatCurrency(financial?.sales?.pending_amount)}
                  </p>
                  <p className="text-amber-200 text-xs mt-2">بحاجة للتحصيل</p>
                </div>
                <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center">
                  <Clock className="w-7 h-7" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Reserved Inventory */}
          <Card className="bg-gradient-to-br from-purple-500 to-indigo-600 text-white border-0">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">مخزون محجوز</p>
                  <p className="text-3xl font-bold mt-1">
                    {formatNumber(financial?.reserved_inventory?.quantity)}
                  </p>
                  <p className="text-purple-200 text-xs mt-2">
                    قيمة:{" "}
                    {formatCurrency(
                      financial?.reserved_inventory?.estimated_value
                    )}
                  </p>
                </div>
                <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center">
                  <Package className="w-7 h-7" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {/* Discounts */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                  <TrendingDown className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <p className="text-sm text-secondary">الخصومات الممنوحة</p>
                  <p className="text-2xl font-bold text-red-600">
                    {formatCurrency(financial?.sales?.discounts_given)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tax */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <Receipt className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-secondary">الضرائب المحصلة</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {formatCurrency(financial?.sales?.tax_collected)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Returns */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                  <ArrowDownRight className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <p className="text-sm text-secondary">المرتجعات</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {formatCurrency(financial?.returns?.total)}
                  </p>
                  <p className="text-xs text-secondary">
                    {financial?.returns?.count || 0} عملية
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="aging" className="space-y-4">
          <TabsList>
            <TabsTrigger value="aging" className="gap-2">
              <Clock className="w-4 h-4" />
              أعمار الذمم
            </TabsTrigger>
            <TabsTrigger value="pending" className="gap-2">
              <ShoppingCart className="w-4 h-4" />
              الطلبات المعلقة
            </TabsTrigger>
            <TabsTrigger value="products" className="gap-2">
              <Package className="w-4 h-4" />
              أفضل المنتجات
            </TabsTrigger>
            <TabsTrigger value="branches" className="gap-2">
              <Building2 className="w-4 h-4" />
              مقارنة الفروع
            </TabsTrigger>
          </TabsList>

          {/* Receivables Aging Tab */}
          <TabsContent value="aging">
            <Card>
              <CardHeader>
                <CardTitle>تقرير أعمار الذمم المدينة</CardTitle>
                <CardDescription>
                  الفواتير غير المسددة مصنفة حسب تاريخ الاستحقاق
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {/* Current (0-30 days) */}
                  <div className="p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                    <p className="text-sm text-green-700 dark:text-green-300">
                      0-30 يوم
                    </p>
                    <p className="text-2xl font-bold text-green-600 mt-1">
                      {formatCurrency(aging?.aging?.current?.amount)}
                    </p>
                    <p className="text-xs text-green-600 mt-1">
                      {aging?.aging?.current?.count || 0} فواتير
                    </p>
                  </div>

                  {/* 31-60 days */}
                  <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                    <p className="text-sm text-amber-700 dark:text-amber-300">
                      31-60 يوم
                    </p>
                    <p className="text-2xl font-bold text-amber-600 mt-1">
                      {formatCurrency(aging?.aging?.days_31_60?.amount)}
                    </p>
                    <p className="text-xs text-amber-600 mt-1">
                      {aging?.aging?.days_31_60?.count || 0} فواتير
                    </p>
                  </div>

                  {/* 61-90 days */}
                  <div className="p-4 rounded-xl bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800">
                    <p className="text-sm text-orange-700 dark:text-orange-300">
                      61-90 يوم
                    </p>
                    <p className="text-2xl font-bold text-orange-600 mt-1">
                      {formatCurrency(aging?.aging?.days_61_90?.amount)}
                    </p>
                    <p className="text-xs text-orange-600 mt-1">
                      {aging?.aging?.days_61_90?.count || 0} فواتير
                    </p>
                  </div>

                  {/* Over 90 days */}
                  <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                    <p className="text-sm text-red-700 dark:text-red-300">
                      أكثر من 90 يوم
                    </p>
                    <p className="text-2xl font-bold text-red-600 mt-1">
                      {formatCurrency(aging?.aging?.over_90?.amount)}
                    </p>
                    <p className="text-xs text-red-600 mt-1">
                      {aging?.aging?.over_90?.count || 0} فواتير
                    </p>
                  </div>
                </div>

                {/* Total */}
                <div className="mt-6 p-4 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-between">
                  <span className="font-medium text-main">
                    إجمالي المبالغ المستحقة
                  </span>
                  <span className="text-2xl font-bold text-primary">
                    {formatCurrency(aging?.total_pending)}
                  </span>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pending Orders Tab */}
          <TabsContent value="pending">
            <Card>
              <CardHeader>
                <CardTitle>الطلبات المعلقة</CardTitle>
                <CardDescription>الطلبات التي لم تسلم بعد</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  {pendingOrders?.by_status?.map((status) => (
                    <div
                      key={status.status}
                      className="p-4 rounded-xl border hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline">
                          {getStatusLabel(status.status)}
                        </Badge>
                        <span className="text-xl font-bold text-primary">
                          {status.count}
                        </span>
                      </div>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-secondary">القيمة:</span>
                          <span className="font-medium text-main">
                            {formatCurrency(status.total_value)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-secondary">المدفوع:</span>
                          <span className="font-medium text-green-600">
                            {formatCurrency(status.paid_amount)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Summary */}
                <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-sm text-secondary">إجمالي الطلبات</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {pendingOrders?.total?.count || 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-secondary">القيمة الإجمالية</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {formatCurrency(pendingOrders?.total?.total_value)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-secondary">عناصر محجوزة</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {pendingOrders?.total?.reserved_items || 0}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Top Products Tab */}
          <TabsContent value="products">
            <Card>
              <CardHeader>
                <CardTitle>أكثر المنتجات مبيعاً</CardTitle>
                <CardDescription>خلال {periodLabels[period]}</CardDescription>
              </CardHeader>
              <CardContent>
                {!topProducts || topProducts.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                    <p className="text-secondary">لا توجد بيانات</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {topProducts.map((product, index) => (
                      <div
                        key={product.product_variant_id}
                        className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800"
                      >
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-main">
                            {product.product_name}
                          </p>
                          <p className="text-xs text-secondary">
                            {product.variant_name}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-main">
                            {formatNumber(product.total_sold)} وحدة
                          </p>
                          <p className="text-xs text-secondary">
                            {formatCurrency(product.total_revenue)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Branch Comparison Tab */}
          <TabsContent value="branches">
            <Card>
              <CardHeader>
                <CardTitle>مقارنة أداء الفروع</CardTitle>
                <CardDescription>خلال {periodLabels[period]}</CardDescription>
              </CardHeader>
              <CardContent>
                {!branchComparison || branchComparison.length === 0 ? (
                  <div className="text-center py-12">
                    <Building2 className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                    <p className="text-secondary">لا توجد بيانات</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {branchComparison.map((branch, index) => {
                      const maxRevenue = Math.max(
                        ...branchComparison.map((b) => b.total_revenue || 0)
                      );
                      const percentage =
                        maxRevenue > 0
                          ? ((branch.total_revenue || 0) / maxRevenue) * 100
                          : 0;

                      return (
                        <div key={branch.branch_id} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                  index === 0
                                    ? "bg-amber-100 text-amber-600"
                                    : index === 1
                                    ? "bg-gray-200 text-gray-600"
                                    : index === 2
                                    ? "bg-orange-100 text-orange-600"
                                    : "bg-gray-100 text-gray-500"
                                }`}
                              >
                                {index + 1}
                              </div>
                              <div>
                                <p className="font-medium text-main">
                                  {branch.branch_name}
                                </p>
                                <p className="text-xs text-secondary">
                                  {branch.orders_count} طلب | متوسط:{" "}
                                  {formatCurrency(branch.avg_order)}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-bold text-primary">
                                {formatCurrency(branch.total_revenue)}
                              </p>
                            </div>
                          </div>

                          {/* Progress Bar */}
                          <div className="h-2 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                index === 0
                                  ? "bg-emerald-500"
                                  : index === 1
                                  ? "bg-blue-500"
                                  : index === 2
                                  ? "bg-purple-500"
                                  : "bg-gray-400"
                              }`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

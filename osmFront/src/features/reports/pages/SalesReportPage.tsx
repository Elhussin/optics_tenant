// features/reports/pages/SalesReportPage.tsx
/**
 * صفحة تقرير المبيعات
 */

"use client";

import React, { useEffect, useState } from "react";
import {
  ShoppingCart,
  Download,
  RefreshCw,
  TrendingUp,
  DollarSign,
  Users,
  Package,
  FileSpreadsheet,
  Printer,
} from "lucide-react";
import { Card, CardContent } from "@/src/shared/components/shadcn/ui/card";
import { Button } from "@/src/shared/components/shadcn/ui/button";
import { useSalesReport, useReportExport } from "../hooks/useReports";
import { DateRangePicker } from "../components/DateRangePicker";
import {
  StatCard,
  ReportSection,
  SummaryStats,
} from "../components/ReportCard";
import { BarChart, LineChart, DonutChart } from "../components/ReportChart";
import type { DateRange } from "../types/reports.types";

export function SalesReportPage() {
  const { report, loading, error, fetchReport } = useSalesReport();
  const {
    loading: exportLoading,
    exportToExcel,
    exportToPDF,
  } = useReportExport();

  const [dateRange, setDateRange] = useState<DateRange>(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    return {
      start_date: start.toISOString().split("T")[0],
      end_date: now.toISOString().split("T")[0],
    };
  });

  useEffect(() => {
    fetchReport(dateRange);
  }, []);

  const handleApplyDateRange = () => {
    fetchReport(dateRange);
  };

  // Prepare chart data
  const dailySalesData =
    report?.daily_sales.slice(-7).map((d) => ({
      label: new Date(d.date).toLocaleDateString("ar-SA", { weekday: "short" }),
      value: parseFloat(d.total_amount),
    })) || [];

  const paymentMethodsData =
    report?.summary.payment_methods.map((pm, i) => ({
      label:
        pm.method === "cash"
          ? "نقداً"
          : pm.method === "card"
          ? "بطاقة"
          : pm.method === "bank_transfer"
          ? "تحويل"
          : pm.method,
      value: pm.count,
      color: ["#3B82F6", "#10B981", "#8B5CF6", "#F59E0B"][i % 4],
    })) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-primary to-blue-600 text-white shadow-lg shadow-primary/30">
              <ShoppingCart className="w-6 h-6" />
            </div>
            تقرير المبيعات
          </h1>
          <p className="text-gray-500 mt-1">تحليل شامل لأداء المبيعات</p>
        </div>

        <div className="flex items-center gap-3">
          <DateRangePicker
            value={dateRange}
            onChange={setDateRange}
            onApply={handleApplyDateRange}
          />
          <Button
            variant="outline"
            onClick={handleApplyDateRange}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
          <Button
            variant="outline"
            onClick={() => exportToExcel("sales", dateRange)}
            disabled={exportLoading}
          >
            <FileSpreadsheet className="w-4 h-4" />
          </Button>
          <Button variant="outline" onClick={() => window.print()}>
            <Printer className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {loading && !report ? (
        <div className="p-12 text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">جاري تحميل التقرير...</p>
        </div>
      ) : report ? (
        <>
          {/* Summary Stats */}
          <SummaryStats
            stats={[
              {
                label: "إجمالي الطلبات",
                value: report.summary.total_orders,
                icon: <ShoppingCart className="w-6 h-6" />,
              },
              {
                label: "إجمالي المبيعات",
                value: `${parseFloat(
                  report.summary.total_amount
                ).toLocaleString()} ر.س`,
                icon: <DollarSign className="w-6 h-6" />,
              },
              {
                label: "صافي الربح",
                value: `${parseFloat(
                  report.summary.gross_profit
                ).toLocaleString()} ر.س`,
                icon: <TrendingUp className="w-6 h-6" />,
              },
              {
                label: "متوسط قيمة الطلب",
                value: `${parseFloat(
                  report.summary.average_order_value
                ).toLocaleString()} ر.س`,
                icon: <Package className="w-6 h-6" />,
              },
            ]}
          />

          {/* Charts Row */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Daily Sales Chart */}
            <ReportSection
              title="المبيعات اليومية"
              icon={<TrendingUp className="w-5 h-5 text-primary" />}
            >
              <BarChart data={dailySalesData} height={200} />
            </ReportSection>

            {/* Payment Methods */}
            <ReportSection
              title="طرق الدفع"
              icon={<DollarSign className="w-5 h-5 text-primary" />}
            >
              <div className="flex justify-center">
                <DonutChart
                  data={paymentMethodsData}
                  size={180}
                  centerLabel="إجمالي"
                  centerValue={report.summary.total_orders.toString()}
                />
              </div>
            </ReportSection>
          </div>

          {/* Top Products & Customers */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Top Products */}
            <ReportSection
              title="أفضل المنتجات"
              icon={<Package className="w-5 h-5 text-primary" />}
            >
              <div className="space-y-3">
                {report.top_products.slice(0, 5).map((product, index) => (
                  <div
                    key={product.product_id}
                    className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                  >
                    <span className="w-8 h-8 flex items-center justify-center bg-primary/10 text-primary font-bold rounded-lg">
                      {index + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">
                        {product.product_name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {product.quantity_sold} وحدة
                      </div>
                    </div>
                    <div className="text-left">
                      <div className="font-bold">
                        {parseFloat(product.total_amount).toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500">ر.س</div>
                    </div>
                  </div>
                ))}
              </div>
            </ReportSection>

            {/* Top Customers */}
            <ReportSection
              title="أفضل العملاء"
              icon={<Users className="w-5 h-5 text-primary" />}
            >
              <div className="space-y-3">
                {report.top_customers.slice(0, 5).map((customer, index) => (
                  <div
                    key={customer.customer_id}
                    className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                  >
                    <span className="w-8 h-8 flex items-center justify-center bg-green-100 text-green-600 font-bold rounded-lg">
                      {index + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">
                        {customer.customer_name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {customer.orders_count} طلب
                      </div>
                    </div>
                    <div className="text-left">
                      <div className="font-bold">
                        {parseFloat(customer.total_amount).toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500">ر.س</div>
                    </div>
                  </div>
                ))}
              </div>
            </ReportSection>
          </div>

          {/* Orders By Status */}
          <ReportSection
            title="الطلبات حسب الحالة"
            icon={<ShoppingCart className="w-5 h-5 text-primary" />}
          >
            <div className="grid gap-4 md:grid-cols-5">
              {report.summary.orders_by_status.map((status) => (
                <div
                  key={status.status}
                  className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center"
                >
                  <div className="text-2xl font-bold">{status.count}</div>
                  <div className="text-sm text-gray-500">{status.status}</div>
                  <div className="text-xs text-primary mt-1">
                    {parseFloat(status.amount).toLocaleString()} ر.س
                  </div>
                </div>
              ))}
            </div>
          </ReportSection>
        </>
      ) : error ? (
        <Card className="border-0 shadow-lg">
          <CardContent className="py-12 text-center text-red-500">
            <p>{error}</p>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}

export default SalesReportPage;

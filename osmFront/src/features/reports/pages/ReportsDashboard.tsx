// features/reports/pages/ReportsDashboard.tsx
/**
 * لوحة تحكم التقارير
 */

"use client";

import React, { useEffect } from "react";
import {
  BarChart3,
  ShoppingCart,
  Users,
  Package,
  TrendingUp,
  Clock,
  Building2,
  FileText,
  ArrowLeft,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/shared/components/shadcn/ui/card";
import { Button } from "@/src/shared/components/shadcn/ui/button";
import { useDashboardMetrics } from "../hooks/useReports";
import { StatCard } from "../components/ReportCard";
import { BarChart } from "../components/ReportChart";
import { Link } from "@/src/app/i18n/navigation";

interface ReportLink {
  href: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

const reportLinks: ReportLink[] = [
  {
    href: "/dashboard/reports/sales",
    title: "تقرير المبيعات",
    description: "تحليل شامل للمبيعات والأرباح",
    icon: <ShoppingCart className="w-6 h-6" />,
    color: "from-blue-500 to-blue-600",
  },
  {
    href: "/dashboard/reports/wholesale",
    title: "تقرير الجملة",
    description: "مبيعات وأرصدة عملاء الجملة",
    icon: <Building2 className="w-6 h-6" />,
    color: "from-purple-500 to-purple-600",
  },
  {
    href: "/dashboard/reports/receivables",
    title: "الذمم المدينة",
    description: "تقرير أعمار الديون",
    icon: <Clock className="w-6 h-6" />,
    color: "from-orange-500 to-orange-600",
  },
  {
    href: "/dashboard/reports/inventory",
    title: "تقرير المخزون",
    description: "حالة المخزون والمنتجات",
    icon: <Package className="w-6 h-6" />,
    color: "from-green-500 to-green-600",
  },
  {
    href: "/dashboard/reports/insurance",
    title: "تقرير التأمين",
    description: "مطالبات التأمين والتحصيل",
    icon: <FileText className="w-6 h-6" />,
    color: "from-cyan-500 to-cyan-600",
  },
  {
    href: "/dashboard/accounting/reports",
    title: "التقارير المالية",
    description: "ميزان المراجعة وقائمة الدخل",
    icon: <TrendingUp className="w-6 h-6" />,
    color: "from-red-500 to-red-600",
  },
];

export function ReportsDashboard() {
  const { metrics, loading, fetchMetrics } = useDashboardMetrics();

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  // Revenue chart data
  const revenueData =
    metrics?.revenue_chart.labels.map((label, i) => ({
      label,
      value: metrics.revenue_chart.data[i],
    })) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-primary to-blue-600 text-white shadow-lg shadow-primary/30">
            <BarChart3 className="w-6 h-6" />
          </div>
          مركز التقارير
        </h1>
        <p className="text-gray-500 mt-1">عرض وتحليل البيانات</p>
      </div>

      {/* Quick Stats */}
      {loading ? (
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="border-0 shadow animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2" />
                <div className="h-8 bg-gray-200 rounded w-3/4" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : metrics ? (
        <div className="grid gap-4 md:grid-cols-4">
          <StatCard
            title="مبيعات اليوم"
            value={`${parseFloat(metrics.today.revenue).toLocaleString()} ر.س`}
            subtitle={`${metrics.today.orders} طلب`}
            icon={<ShoppingCart className="w-6 h-6" />}
            colorClass="from-blue-500 to-blue-600"
          />
          <StatCard
            title="مبيعات الشهر"
            value={`${parseFloat(metrics.month.revenue).toLocaleString()} ر.س`}
            trend={{
              value: parseFloat(metrics.month.growth_percent),
              isPositive: parseFloat(metrics.month.growth_percent) >= 0,
            }}
            icon={<TrendingUp className="w-6 h-6" />}
            colorClass="from-green-500 to-green-600"
          />
          <StatCard
            title="عملاء اليوم"
            value={metrics.today.customers}
            icon={<Users className="w-6 h-6" />}
            colorClass="from-purple-500 to-purple-600"
          />
          <StatCard
            title="مبيعات السنة"
            value={`${parseFloat(metrics.year.revenue).toLocaleString()} ر.س`}
            trend={{
              value: parseFloat(metrics.year.growth_percent),
              isPositive: parseFloat(metrics.year.growth_percent) >= 0,
            }}
            icon={<BarChart3 className="w-6 h-6" />}
            colorClass="from-orange-500 to-orange-600"
          />
        </div>
      ) : null}

      {/* Revenue Chart & Recent Orders */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Revenue Chart */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>الإيرادات الشهرية</CardTitle>
          </CardHeader>
          <CardContent>
            {revenueData.length > 0 ? (
              <BarChart data={revenueData} height={250} />
            ) : (
              <div className="h-[250px] flex items-center justify-center text-gray-400">
                لا توجد بيانات
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>آخر الطلبات</CardTitle>
          </CardHeader>
          <CardContent>
            {metrics?.recent_orders.length ? (
              <div className="space-y-3">
                {metrics.recent_orders.slice(0, 5).map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                  >
                    <div>
                      <div className="font-medium">{order.order_number}</div>
                      <div className="text-sm text-gray-500">
                        {order.customer_name}
                      </div>
                    </div>
                    <div className="text-left">
                      <div className="font-bold">
                        {parseFloat(order.total).toLocaleString()} ر.س
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(order.created_at).toLocaleDateString("ar-SA")}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-gray-400">
                لا توجد طلبات
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Report Links */}
      <div>
        <h2 className="text-lg font-semibold mb-4">التقارير المتوفرة</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {reportLinks.map((report) => (
            <Link key={report.href} href={report.href}>
              <Card className="border-0 shadow-lg hover:shadow-xl transition-all cursor-pointer group h-full">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div
                      className={`p-3 rounded-xl bg-gradient-to-br ${report.color} text-white`}
                    >
                      {report.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold group-hover:text-primary transition-colors">
                        {report.title}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {report.description}
                      </p>
                    </div>
                    <ArrowLeft className="w-5 h-5 text-gray-300 group-hover:text-primary group-hover:-translate-x-1 transition-all" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ReportsDashboard;

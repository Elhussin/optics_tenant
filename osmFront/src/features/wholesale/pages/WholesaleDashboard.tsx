// features/wholesale/pages/WholesaleDashboard.tsx
/**
 * لوحة تحكم البيع بالجملة
 */

"use client";

import React, { useEffect } from "react";
import {
  BarChart3,
  Users,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Trophy,
  Package,
  Clock,
  ArrowUpRight,
  Percent,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/src/shared/components/shadcn/ui/card";
import { useWholesaleDashboard } from "../hooks/useWholesale";
import { Link } from "@/src/app/i18n/navigation";

export function WholesaleDashboard() {
  const { dashboard, loading, error, fetchDashboard } = useWholesaleDashboard();

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  if (loading && !dashboard) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">جاري تحميل البيانات...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center text-red-500">
          <AlertTriangle className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p>{error}</p>
        </div>
      </div>
    );
  }

  const stats = dashboard?.month_stats || {
    orders_count: 0,
    total_sales: "0",
    total_discount: "0",
  };
  const receivables = dashboard?.receivables || {
    total: "0",
    customers_count: 0,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-primary to-blue-600 text-white shadow-lg shadow-primary/30">
              <BarChart3 className="w-6 h-6" />
            </div>
            لوحة تحكم الجملة
          </h1>
          <p className="text-gray-500 mt-1">إحصائيات ومؤشرات البيع بالجملة</p>
        </div>
        <Link href="/dashboard/wholesale/orders/create">
          <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
            <Package className="w-4 h-4" />
            طلب جملة جديد
          </button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Orders Count */}
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">طلبات الشهر</p>
                <p className="text-3xl font-bold mt-1">{stats.orders_count}</p>
              </div>
              <div className="p-3 bg-white/20 rounded-lg">
                <Package className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Sales */}
        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-500 to-green-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">إجمالي المبيعات</p>
                <p className="text-3xl font-bold mt-1">
                  {parseFloat(stats.total_sales).toLocaleString()}
                </p>
                <p className="text-green-100 text-xs">ر.س</p>
              </div>
              <div className="p-3 bg-white/20 rounded-lg">
                <DollarSign className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Discount */}
        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">إجمالي الخصومات</p>
                <p className="text-3xl font-bold mt-1">
                  {parseFloat(stats.total_discount).toLocaleString()}
                </p>
                <p className="text-purple-100 text-xs">ر.س</p>
              </div>
              <div className="p-3 bg-white/20 rounded-lg">
                <Percent className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Receivables */}
        <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-500 to-orange-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm">الذمم المستحقة</p>
                <p className="text-3xl font-bold mt-1">
                  {parseFloat(receivables.total).toLocaleString()}
                </p>
                <p className="text-orange-100 text-xs">
                  {receivables.customers_count} عميل
                </p>
              </div>
              <div className="p-3 bg-white/20 rounded-lg">
                <Clock className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Two Column Layout */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top Customers */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              أفضل العملاء
            </CardTitle>
            <CardDescription>العملاء الأكثر شراءً هذا الشهر</CardDescription>
          </CardHeader>
          <CardContent>
            {dashboard?.top_customers?.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <Users className="w-12 h-12 mx-auto mb-2 opacity-30" />
                <p>لا توجد بيانات</p>
              </div>
            ) : (
              <div className="space-y-3">
                {dashboard?.top_customers?.map((customer, index) => (
                  <div
                    key={customer.customer_id}
                    className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                        index === 0
                          ? "bg-yellow-500"
                          : index === 1
                          ? "bg-gray-400"
                          : index === 2
                          ? "bg-orange-400"
                          : "bg-gray-300"
                      }`}
                    >
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{customer.name}</div>
                      <div className="text-xs text-gray-500">
                        {customer.orders_count} طلب
                      </div>
                    </div>
                    <div className="text-left">
                      <div className="font-bold text-primary">
                        {parseFloat(customer.total).toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500">ر.س</div>
                    </div>
                    <Link
                      href={`/dashboard/wholesale/customers/${customer.customer_id}`}
                    >
                      <ArrowUpRight className="w-4 h-4 text-gray-400 hover:text-primary" />
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              إجراءات سريعة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <Link href="/dashboard/wholesale/customers">
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-primary/10 transition-colors cursor-pointer text-center">
                  <Users className="w-8 h-8 text-primary mx-auto mb-2" />
                  <div className="font-medium">عملاء الجملة</div>
                </div>
              </Link>
              <Link href="/dashboard/wholesale/orders/create">
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-primary/10 transition-colors cursor-pointer text-center">
                  <Package className="w-8 h-8 text-primary mx-auto mb-2" />
                  <div className="font-medium">طلب جديد</div>
                </div>
              </Link>
              <Link href="/dashboard/wholesale/statements">
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-primary/10 transition-colors cursor-pointer text-center">
                  <BarChart3 className="w-8 h-8 text-primary mx-auto mb-2" />
                  <div className="font-medium">كشوف الحساب</div>
                </div>
              </Link>
              <Link href="/dashboard/wholesale/pricing">
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-primary/10 transition-colors cursor-pointer text-center">
                  <DollarSign className="w-8 h-8 text-primary mx-auto mb-2" />
                  <div className="font-medium">حاسبة الأسعار</div>
                </div>
              </Link>
            </div>

            {/* Overdue Alert */}
            {(dashboard?.overdue_count || 0) > 0 && (
              <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-6 h-6 text-red-500" />
                  <div>
                    <div className="font-medium text-red-700 dark:text-red-400">
                      عملاء متأخرين في السداد
                    </div>
                    <div className="text-sm text-red-600 dark:text-red-500">
                      {dashboard?.overdue_count} عميل يحتاج متابعة
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default WholesaleDashboard;

// features/mobile/pages/MobileDashboard.tsx
/**
 * Mobile Dashboard Page
 * صفحة لوحة التحكم للموبايل
 */

"use client";

import React from "react";
import {
  ShoppingCart,
  Package,
  Users,
  TrendingUp,
  Plus,
  ArrowLeft,
  Clock,
  DollarSign,
} from "lucide-react";
import { Link } from "@/src/app/i18n/navigation";
import { GlassCard } from "@/src/shared/components/ui/GlassCard";
import { cn } from "@/src/shared/utils/cn";

// Quick action card
interface QuickActionProps {
  icon: React.ReactNode;
  label: string;
  href: string;
  color: string;
  badge?: number;
}

function QuickAction({ icon, label, href, color, badge }: QuickActionProps) {
  return (
    <Link href={href}>
      <div
        className={cn(
          "relative p-4 rounded-2xl text-center",
          "transition-all duration-200 active:scale-95",
          color
        )}
      >
        {badge && badge > 0 && (
          <span className="absolute -top-1 -right-1 min-w-5 h-5 flex items-center justify-center text-xs font-bold bg-danger text-white rounded-full px-1">
            {badge > 99 ? "99+" : badge}
          </span>
        )}
        <div className="w-10 h-10 mx-auto mb-2 flex items-center justify-center text-white">
          {icon}
        </div>
        <span className="text-sm font-medium text-white">{label}</span>
      </div>
    </Link>
  );
}

// Stat card
interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: { value: number; positive: boolean };
}

function StatCard({ title, value, subtitle, icon, trend }: StatCardProps) {
  return (
    <div className="p-4 rounded-2xl bg-surface border border-border-main">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-secondary mb-1">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
          {subtitle && (
            <p className="text-xs text-secondary mt-1">{subtitle}</p>
          )}
          {trend && (
            <p
              className={cn(
                "text-xs mt-1 flex items-center gap-1",
                trend.positive ? "text-success" : "text-danger"
              )}
            >
              <TrendingUp
                className={cn("w-3 h-3", !trend.positive && "rotate-180")}
              />
              {trend.value}%
            </p>
          )}
        </div>
        <div className="p-2 rounded-xl bg-primary/10 text-primary">{icon}</div>
      </div>
    </div>
  );
}

// Recent order item
interface RecentOrderProps {
  orderNumber: string;
  customer: string;
  total: string;
  time: string;
  status: "pending" | "processing" | "completed";
}

function RecentOrder({
  orderNumber,
  customer,
  total,
  time,
  status,
}: RecentOrderProps) {
  const statusColors = {
    pending: "bg-yellow-100 text-yellow-700",
    processing: "bg-blue-100 text-blue-700",
    completed: "bg-green-100 text-green-700",
  };

  const statusLabels = {
    pending: "معلق",
    processing: "قيد التنفيذ",
    completed: "مكتمل",
  };

  return (
    <div className="flex items-center justify-between p-3 rounded-xl bg-elevated">
      <div>
        <div className="flex items-center gap-2">
          <span className="font-medium">{orderNumber}</span>
          <span
            className={cn(
              "text-xs px-2 py-0.5 rounded-full",
              statusColors[status]
            )}
          >
            {statusLabels[status]}
          </span>
        </div>
        <p className="text-sm text-secondary">{customer}</p>
      </div>
      <div className="text-left">
        <p className="font-bold">{total}</p>
        <p className="text-xs text-secondary flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {time}
        </p>
      </div>
    </div>
  );
}

export function MobileDashboard() {
  // Mock data - replace with real data
  const stats = {
    todaySales: "3,250",
    todayOrders: 12,
    pendingOrders: 5,
    lowStock: 8,
  };

  const recentOrders = [
    {
      orderNumber: "#1234",
      customer: "أحمد محمد",
      total: "450 ر.س",
      time: "منذ 5 دقائق",
      status: "pending" as const,
    },
    {
      orderNumber: "#1233",
      customer: "فاطمة علي",
      total: "890 ر.س",
      time: "منذ 15 دقيقة",
      status: "processing" as const,
    },
    {
      orderNumber: "#1232",
      customer: "خالد سعيد",
      total: "320 ر.س",
      time: "منذ ساعة",
      status: "completed" as const,
    },
  ];

  return (
    <div className="pb-20 pt-4">
      {/* Welcome Section */}
      <div className="px-4 mb-6">
        <h1 className="text-2xl font-bold">مرحباً 👋</h1>
        <p className="text-secondary">ملخص اليوم</p>
      </div>

      {/* Stats Grid */}
      <div className="px-4 grid grid-cols-2 gap-3 mb-6">
        <StatCard
          title="مبيعات اليوم"
          value={`${stats.todaySales} ر.س`}
          icon={<DollarSign className="w-5 h-5" />}
          trend={{ value: 12, positive: true }}
        />
        <StatCard
          title="الطلبات"
          value={stats.todayOrders.toString()}
          subtitle="اليوم"
          icon={<ShoppingCart className="w-5 h-5" />}
        />
        <StatCard
          title="طلبات معلقة"
          value={stats.pendingOrders.toString()}
          icon={<Clock className="w-5 h-5" />}
        />
        <StatCard
          title="منتجات منخفضة"
          value={stats.lowStock.toString()}
          icon={<Package className="w-5 h-5" />}
        />
      </div>

      {/* Quick Actions */}
      <div className="px-4 mb-6">
        <h2 className="text-lg font-semibold mb-3">إجراءات سريعة</h2>
        <div className="grid grid-cols-4 gap-3">
          <QuickAction
            icon={<Plus className="w-6 h-6" />}
            label="طلب جديد"
            href="/dashboard/orders/new"
            color="bg-gradient-to-br from-blue-500 to-blue-600"
          />
          <QuickAction
            icon={<Package className="w-6 h-6" />}
            label="المنتجات"
            href="/dashboard/products"
            color="bg-gradient-to-br from-purple-500 to-purple-600"
            badge={stats.lowStock}
          />
          <QuickAction
            icon={<Users className="w-6 h-6" />}
            label="العملاء"
            href="/dashboard/customers"
            color="bg-gradient-to-br from-green-500 to-green-600"
          />
          <QuickAction
            icon={<TrendingUp className="w-6 h-6" />}
            label="التقارير"
            href="/dashboard/reports"
            color="bg-gradient-to-br from-orange-500 to-orange-600"
          />
        </div>
      </div>

      {/* Recent Orders */}
      <div className="px-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">آخر الطلبات</h2>
          <Link
            href="/dashboard/orders"
            className="text-sm text-primary flex items-center gap-1"
          >
            عرض الكل
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </div>
        <div className="space-y-2">
          {recentOrders.map((order, index) => (
            <RecentOrder key={index} {...order} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default MobileDashboard;

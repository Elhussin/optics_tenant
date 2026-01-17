// features/reports/components/ReportCard.tsx
/**
 * بطاقات التقارير
 */

"use client";

import React from "react";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/shared/components/shadcn/ui/card";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  colorClass?: string;
}

export function StatCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  colorClass = "from-primary to-blue-600",
}: StatCardProps) {
  return (
    <Card
      className={`border-0 shadow-lg overflow-hidden bg-gradient-to-br ${colorClass} text-white`}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-white/80">{title}</p>
            <div className="text-3xl font-bold mt-1">
              {typeof value === "number" ? value.toLocaleString() : value}
            </div>
            {subtitle && (
              <p className="text-sm text-white/70 mt-1">{subtitle}</p>
            )}
            {trend && (
              <div
                className={`flex items-center gap-1 mt-2 text-sm ${
                  trend.isPositive ? "text-green-200" : "text-red-200"
                }`}
              >
                {trend.isPositive ? (
                  <ArrowUpRight className="w-4 h-4" />
                ) : (
                  <ArrowDownRight className="w-4 h-4" />
                )}
                <span>{Math.abs(trend.value)}%</span>
              </div>
            )}
          </div>
          {icon && <div className="p-3 bg-white/20 rounded-xl">{icon}</div>}
        </div>
      </CardContent>
    </Card>
  );
}

// Summary Statistics Row
interface SummaryStatsProps {
  stats: {
    label: string;
    value: string | number;
    icon?: React.ReactNode;
    color?: string;
  }[];
}

export function SummaryStats({ stats }: SummaryStatsProps) {
  const colorClasses = [
    "from-blue-500 to-blue-600",
    "from-green-500 to-green-600",
    "from-purple-500 to-purple-600",
    "from-orange-500 to-orange-600",
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => (
        <StatCard
          key={stat.label}
          title={stat.label}
          value={stat.value}
          icon={stat.icon}
          colorClass={stat.color || colorClasses[index % colorClasses.length]}
        />
      ))}
    </div>
  );
}

// Report Section Card
interface ReportSectionProps {
  title: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  children: React.ReactNode;
}

export function ReportSection({
  title,
  icon,
  action,
  children,
}: ReportSectionProps) {
  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          {icon}
          {title}
        </CardTitle>
        {action}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

// Percentage Bar
interface PercentageBarProps {
  label: string;
  value: number;
  total: number;
  color?: string;
}

export function PercentageBar({
  label,
  value,
  total,
  color = "bg-primary",
}: PercentageBarProps) {
  const percent = total > 0 ? (value / total) * 100 : 0;

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-gray-600 dark:text-gray-400">{label}</span>
        <span className="font-medium">{value.toLocaleString()}</span>
      </div>
      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${Math.min(percent, 100)}%` }}
        />
      </div>
    </div>
  );
}

export default StatCard;

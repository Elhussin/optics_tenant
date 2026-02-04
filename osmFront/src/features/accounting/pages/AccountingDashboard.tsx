// features/accounting/pages/AccountingDashboard.tsx
/**
 * داشبورد المحاسبة الرئيسي
 * Premium Glassmorphism Design
 */

"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Calculator,
  BookOpen,
  FileText,
  BarChart3,
  Calendar,
  DollarSign,
  TrendingUp,
  TrendingDown,
  PlusCircle,
  ArrowUpRight,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Clock,
  Percent,
  Layers,
} from "lucide-react";
import {
  useChartOfAccounts,
  useJournalEntries,
  useFinancialReports,
} from "../hooks/useAccounting";

// Premium Quick Stats Card
interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  color: "blue" | "green" | "purple" | "orange" | "red";
  delay?: number;
}

function StatCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  trendValue,
  color,
  delay = 0,
}: StatCardProps) {
  const colorClasses = {
    blue: "from-blue-500 to-cyan-500 shadow-blue-500/30",
    green: "from-emerald-500 to-green-500 shadow-emerald-500/30",
    purple: "from-purple-500 to-violet-500 shadow-purple-500/30",
    orange: "from-orange-500 to-amber-500 shadow-orange-500/30",
    red: "from-red-500 to-rose-500 shadow-red-500/30",
  };

  return (
    <div
      className="group relative overflow-hidden rounded-2xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-white/20 dark:border-gray-700/30 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-1"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Gradient Background Effect */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${colorClasses[color]} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}
      />

      <div className="relative p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              {title}
            </p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {value}
            </p>
            {subtitle && (
              <p className="text-xs text-gray-400 dark:text-gray-500">
                {subtitle}
              </p>
            )}
          </div>
          <div
            className={`p-4 rounded-2xl bg-gradient-to-br ${colorClasses[color]} shadow-lg`}
          >
            {icon}
          </div>
        </div>

        {trend && trendValue && (
          <div className="mt-4 flex items-center gap-2">
            {trend === "up" ? (
              <span className="flex items-center text-sm text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-full">
                <TrendingUp className="w-3.5 h-3.5 ml-1" />
                {trendValue}
              </span>
            ) : trend === "down" ? (
              <span className="flex items-center text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 px-2 py-0.5 rounded-full">
                <TrendingDown className="w-3.5 h-3.5 ml-1" />
                {trendValue}
              </span>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}

// Quick Access Card
interface QuickAccessCardProps {
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
  color: string;
  delay?: number;
}

function QuickAccessCard({
  title,
  description,
  href,
  icon,
  color,
  delay = 0,
}: QuickAccessCardProps) {
  return (
    <Link
      href={href}
      className="group relative overflow-hidden rounded-2xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-white/20 dark:border-gray-700/30 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 p-6"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-xl ${color} text-white shadow-lg`}>
            {icon}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {title}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {description}
            </p>
          </div>
        </div>
        <ArrowUpRight className="w-5 h-5 text-gray-400 group-hover:text-primary group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
      </div>
    </Link>
  );
}

// Recent Entry Row
interface RecentEntryRowProps {
  entryNumber: string;
  date: string;
  description: string;
  amount: string;
  isPosted: boolean;
}

function RecentEntryRow({
  entryNumber,
  date,
  description,
  amount,
  isPosted,
}: RecentEntryRowProps) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-800 last:border-0 hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors px-4 -mx-4 rounded-lg">
      <div className="flex items-center gap-3">
        <div
          className={`p-2 rounded-lg ${
            isPosted
              ? "bg-emerald-100 dark:bg-emerald-500/10"
              : "bg-amber-100 dark:bg-amber-500/10"
          }`}
        >
          {isPosted ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          ) : (
            <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          )}
        </div>
        <div>
          <p className="font-medium text-gray-900 dark:text-white">
            {entryNumber}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[200px]">
            {description}
          </p>
        </div>
      </div>
      <div className="text-left">
        <p className="font-semibold text-gray-900 dark:text-white">
          {amount} ر.س
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400">{date}</p>
      </div>
    </div>
  );
}

export function AccountingDashboard() {
  const {
    accounts,
    loading: accountsLoading,
    fetchAccounts,
  } = useChartOfAccounts();
  const {
    entries,
    loading: entriesLoading,
    fetchEntries,
  } = useJournalEntries();
  const {
    getTrialBalance,
    getBalanceSheet,
    loading: reportsLoading,
  } = useFinancialReports();

  const [stats, setStats] = useState({
    totalAssets: "0",
    totalLiabilities: "0",
    totalEquity: "0",
    netIncome: "0",
    unpostedEntries: 0,
  });

  useEffect(() => {
    fetchAccounts();
    fetchEntries();
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const balanceSheet = await getBalanceSheet();
      if (balanceSheet) {
        setStats((prev) => ({
          ...prev,
          totalAssets: balanceSheet.assets?.total || "0",
          totalLiabilities: balanceSheet.liabilities?.total || "0",
          totalEquity: balanceSheet.equity?.total || "0",
        }));
      }
    } catch (error) {
      console.error("Failed to load stats:", error);
    }
  };

  const loading = accountsLoading || entriesLoading || reportsLoading;
  const unpostedCount = entries.filter((e) => !e.is_posted).length;
  const recentEntries = entries.slice(0, 5);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-4 text-gray-900 dark:text-white">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-primary to-blue-600 text-white shadow-xl shadow-primary/30">
              <Calculator className="w-8 h-8" />
            </div>
            المحاسبة
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2 mr-16">
            إدارة الحسابات والقيود والتقارير المالية
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => {
              fetchAccounts();
              fetchEntries();
              loadStats();
            }}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2.5 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            تحديث
          </button>
          <Link
            href="/dashboard/accounting/journal-entries"
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-primary to-blue-600 text-white rounded-xl hover:shadow-lg hover:shadow-primary/30 transition-all shadow-md"
          >
            <PlusCircle className="w-4 h-4" />
            قيد جديد
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="إجمالي الأصول"
          value={parseFloat(stats.totalAssets).toLocaleString()}
          subtitle="ر.س"
          icon={<DollarSign className="w-6 h-6 text-white" />}
          color="blue"
          trend="up"
          trendValue="+12%"
          delay={0}
        />
        <StatCard
          title="إجمالي الالتزامات"
          value={parseFloat(stats.totalLiabilities).toLocaleString()}
          subtitle="ر.س"
          icon={<TrendingDown className="w-6 h-6 text-white" />}
          color="red"
          delay={100}
        />
        <StatCard
          title="حقوق الملكية"
          value={parseFloat(stats.totalEquity).toLocaleString()}
          subtitle="ر.س"
          icon={<TrendingUp className="w-6 h-6 text-white" />}
          color="green"
          trend="up"
          trendValue="+8%"
          delay={200}
        />
        <StatCard
          title="قيود غير مرحلة"
          value={unpostedCount.toString()}
          subtitle="قيد"
          icon={<AlertCircle className="w-6 h-6 text-white" />}
          color={unpostedCount > 0 ? "orange" : "green"}
          delay={300}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Access */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-primary" />
            الوصول السريع
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <QuickAccessCard
              title="دليل الحسابات"
              description="إدارة شجرة الحسابات المحاسبية"
              href="/dashboard/accounting/chart-of-accounts"
              icon={<BookOpen className="w-5 h-5" />}
              color="bg-gradient-to-br from-blue-500 to-cyan-500"
              delay={0}
            />
            <QuickAccessCard
              title="قيود اليومية"
              description="إنشاء وترحيل القيود المحاسبية"
              href="/dashboard/accounting/journal-entries"
              icon={<FileText className="w-5 h-5" />}
              color="bg-gradient-to-br from-purple-500 to-violet-500"
              delay={100}
            />
            <QuickAccessCard
              title="التقارير المالية"
              description="ميزان المراجعة وقائمة الدخل"
              href="/dashboard/accounting/reports"
              icon={<BarChart3 className="w-5 h-5" />}
              color="bg-gradient-to-br from-emerald-500 to-green-500"
              delay={200}
            />
            <QuickAccessCard
              title="الفترات المالية"
              description="إدارة الفترات المحاسبية"
              href="/dashboard/accounting/financial-periods"
              icon={<Calendar className="w-5 h-5" />}
              color="bg-gradient-to-br from-orange-500 to-amber-500"
              delay={300}
            />
            <QuickAccessCard
              title="الضرائب"
              description="إدارة معدلات الضرائب"
              href="/dashboard/accounting/taxes"
              icon={<Percent className="w-5 h-5" />}
              color="bg-gradient-to-br from-red-500 to-rose-500"
              delay={400}
            />
            <QuickAccessCard
              title="فئات المحاسبة"
              description="تصنيف الإيرادات والمصروفات"
              href="/dashboard/accounting/categories"
              icon={<Layers className="w-5 h-5" />}
              color="bg-gradient-to-br from-indigo-500 to-purple-500"
              delay={500}
            />
          </div>
        </div>

        {/* Recent Entries */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              آخر القيود
            </h2>
            <Link
              href="/dashboard/accounting/journal-entries"
              className="text-sm text-primary hover:underline flex items-center gap-1"
            >
              عرض الكل
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-white/20 dark:border-gray-700/30 rounded-2xl shadow-lg p-4">
            {entriesLoading ? (
              <div className="py-8 text-center">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
              </div>
            ) : recentEntries.length === 0 ? (
              <div className="py-8 text-center text-gray-400 dark:text-gray-500">
                <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>لا توجد قيود</p>
              </div>
            ) : (
              <div className="space-y-1">
                {recentEntries.map((entry) => (
                  <RecentEntryRow
                    key={entry.id}
                    entryNumber={entry.entry_number}
                    date={entry.entry_date}
                    description={entry.description}
                    amount={parseFloat(entry.total_debit).toLocaleString()}
                    isPosted={entry.is_posted}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Account Summary */}
      <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-white/20 dark:border-gray-700/30 rounded-2xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-primary" />
          ملخص الحسابات
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { type: "asset", label: "أصول", count: 0, color: "blue" },
            { type: "liability", label: "التزامات", count: 0, color: "red" },
            { type: "equity", label: "حقوق ملكية", count: 0, color: "purple" },
            { type: "revenue", label: "إيرادات", count: 0, color: "green" },
            { type: "expense", label: "مصروفات", count: 0, color: "orange" },
            { type: "cogs", label: "تكلفة البضاعة", count: 0, color: "pink" },
          ].map((item) => {
            const count = accounts.filter(
              (a) => a.account_type === item.type,
            ).length;
            const colorMap: Record<string, string> = {
              blue: "bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400",
              red: "bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-400",
              purple:
                "bg-purple-100 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400",
              green:
                "bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400",
              orange:
                "bg-orange-100 dark:bg-orange-500/10 text-orange-700 dark:text-orange-400",
              pink: "bg-pink-100 dark:bg-pink-500/10 text-pink-700 dark:text-pink-400",
            };

            return (
              <div
                key={item.type}
                className={`rounded-xl p-4 text-center ${colorMap[item.color]}`}
              >
                <p className="text-2xl font-bold">{count}</p>
                <p className="text-sm opacity-80">{item.label}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default AccountingDashboard;

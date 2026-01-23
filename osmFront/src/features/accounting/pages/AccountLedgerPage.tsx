// features/accounting/pages/AccountLedgerPage.tsx
/**
 * صفحة دفتر الأستاذ
 * Premium Glassmorphism Design
 */

"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import {
  BookOpen,
  RefreshCw,
  Printer,
  Download,
  Calendar,
  ArrowLeft,
  ChevronDown,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/shared/components/shadcn/ui/card";
import { Button } from "@/src/shared/components/shadcn/ui/button";
import { Input } from "@/src/shared/components/shadcn/ui/input";
import {
  useChartOfAccounts,
  useFinancialReports,
} from "../hooks/useAccounting";
import type { AccountLedger, ChartOfAccount } from "../types/accounting.types";

export function AccountLedgerPage() {
  const searchParams = useSearchParams();
  const accountIdParam = searchParams.get("accountId");

  const { accounts, fetchAccounts } = useChartOfAccounts();
  const { getAccountLedger, loading } = useFinancialReports();

  const [selectedAccountId, setSelectedAccountId] = useState<number | null>(
    accountIdParam ? parseInt(accountIdParam) : null,
  );
  const [ledger, setLedger] = useState<AccountLedger | null>(null);
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setMonth(0);
    date.setDate(1);
    return date.toISOString().split("T")[0];
  });
  const [endDate, setEndDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  const loadLedger = useCallback(async () => {
    if (!selectedAccountId) return;

    setError(null);
    try {
      const data = await getAccountLedger(
        selectedAccountId,
        startDate,
        endDate,
      );
      setLedger(data);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "فشل في جلب دفتر الأستاذ";
      setError(errorMessage);
    }
  }, [selectedAccountId, startDate, endDate, getAccountLedger]);

  useEffect(() => {
    if (selectedAccountId) {
      loadLedger();
    }
  }, [selectedAccountId, loadLedger]);

  const handlePrint = () => {
    window.print();
  };

  // Get non-header accounts for selection
  const selectableAccounts = accounts.filter((a) => !a.is_header);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between print:hidden">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Link
              href="/dashboard/accounting/chart-of-accounts"
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-2xl font-bold flex items-center gap-3 text-gray-900 dark:text-white">
              <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/30">
                <BookOpen className="w-6 h-6" />
              </div>
              دفتر الأستاذ
            </h1>
          </div>
          <p className="text-gray-500 dark:text-gray-400 mr-10">
            عرض حركات الحساب والرصيد الجاري
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="w-4 h-4 ml-2" />
            طباعة
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 ml-2" />
            تصدير
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-lg print:hidden">
        <CardContent className="py-4">
          <div className="flex flex-wrap items-center gap-4">
            {/* Account Selector */}
            <div className="flex-1 min-w-[200px]">
              <label className="block text-xs text-gray-500 mb-1">الحساب</label>
              <div className="relative">
                <select
                  value={selectedAccountId || ""}
                  onChange={(e) =>
                    setSelectedAccountId(
                      e.target.value ? parseInt(e.target.value) : null,
                    )
                  }
                  className="w-full px-3 py-2 pr-10 border rounded-lg bg-white dark:bg-gray-900 appearance-none cursor-pointer"
                >
                  <option value="">اختر الحساب...</option>
                  {selectableAccounts.map((account) => (
                    <option key={account.id} value={account.id}>
                      {account.code} - {account.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Date Range */}
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <div>
                <label className="block text-xs text-gray-500 mb-1">من</label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-40"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">إلى</label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-40"
                />
              </div>
            </div>

            {/* Refresh */}
            <Button
              onClick={loadLedger}
              disabled={loading || !selectedAccountId}
              className="mt-5"
            >
              <RefreshCw
                className={`w-4 h-4 ml-2 ${loading ? "animate-spin" : ""}`}
              />
              تحديث
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Ledger Content */}
      {!selectedAccountId ? (
        <Card className="border-0 shadow-lg">
          <CardContent className="py-12 text-center text-gray-400">
            <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <h3 className="text-lg font-semibold mb-2">اختر حساباً</h3>
            <p>حدد الحساب المراد عرض دفتر الأستاذ الخاص به</p>
          </CardContent>
        </Card>
      ) : loading ? (
        <Card className="border-0 shadow-lg">
          <CardContent className="py-12 text-center">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-500">جاري تحميل البيانات...</p>
          </CardContent>
        </Card>
      ) : error ? (
        <Card className="border-0 shadow-lg">
          <CardContent className="py-12 text-center text-red-500">
            <p>{error}</p>
          </CardContent>
        </Card>
      ) : ledger ? (
        <>
          {/* Account Info Header */}
          <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 print:bg-white print:shadow-none">
            <CardContent className="py-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">الحساب</p>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    {ledger.account.code} - {ledger.account.name}
                  </h2>
                </div>
                <div className="text-left">
                  <p className="text-sm text-gray-500 mb-1">الفترة</p>
                  <p className="font-medium">
                    من {startDate} إلى {endDate}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Balance Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border-0 shadow-lg">
              <CardContent className="py-4 text-center">
                <p className="text-sm text-gray-500 mb-1">الرصيد الافتتاحي</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {Number(ledger.opening_balance).toLocaleString()} ر.س
                </p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-lg">
              <CardContent className="py-4 text-center">
                <p className="text-sm text-gray-500 mb-1">الرصيد الختامي</p>
                <p className="text-2xl font-bold text-primary">
                  {Number(ledger.closing_balance).toLocaleString()} ر.س
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Entries Table */}
          <Card className="border-0 shadow-lg print:shadow-none">
            <CardHeader className="print:pb-2">
              <CardTitle>حركات الحساب</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {ledger.entries.length === 0 ? (
                <div className="p-8 text-center text-gray-400">
                  <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>لا توجد حركات في هذه الفترة</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-gray-50 dark:bg-gray-800 print:bg-gray-100">
                        <th className="text-right py-3 px-4 font-semibold">
                          التاريخ
                        </th>
                        <th className="text-right py-3 px-4 font-semibold">
                          رقم القيد
                        </th>
                        <th className="text-right py-3 px-4 font-semibold">
                          البيان
                        </th>
                        <th className="text-left py-3 px-4 font-semibold">
                          مدين
                        </th>
                        <th className="text-left py-3 px-4 font-semibold">
                          دائن
                        </th>
                        <th className="text-left py-3 px-4 font-semibold">
                          الرصيد
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {ledger.entries.map((entry, idx) => (
                        <tr
                          key={idx}
                          className="border-b hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        >
                          <td className="py-3 px-4 text-sm">{entry.date}</td>
                          <td className="py-3 px-4">
                            <span className="font-mono text-primary">
                              {entry.entry_number}
                            </span>
                          </td>
                          <td className="py-3 px-4 max-w-xs truncate">
                            {entry.description}
                          </td>
                          <td className="py-3 px-4 text-left font-medium text-green-600">
                            {Number(entry.debit) > 0
                              ? Number(entry.debit).toLocaleString()
                              : "-"}
                          </td>
                          <td className="py-3 px-4 text-left font-medium text-red-600">
                            {Number(entry.credit) > 0
                              ? Number(entry.credit).toLocaleString()
                              : "-"}
                          </td>
                          <td className="py-3 px-4 text-left font-bold">
                            {Number(entry.balance).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="bg-gray-100 dark:bg-gray-800 font-bold">
                        <td colSpan={5} className="py-3 px-4">
                          الرصيد الختامي
                        </td>
                        <td className="py-3 px-4 text-left text-primary text-lg">
                          {Number(ledger.closing_balance).toLocaleString()} ر.س
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      ) : null}
    </div>
  );
}

export default AccountLedgerPage;

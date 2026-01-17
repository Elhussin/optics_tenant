// features/accounting/pages/ChartOfAccountsPage.tsx
/**
 * صفحة دليل الحسابات
 */

"use client";

import React, { useEffect, useState } from "react";
import {
  BookOpen,
  Plus,
  RefreshCw,
  Settings,
  Search,
  AlertCircle,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/src/shared/components/shadcn/ui/card";
import { Button } from "@/src/shared/components/shadcn/ui/button";
import { Input } from "@/src/shared/components/shadcn/ui/input";
import { useChartOfAccounts } from "../hooks/useAccounting";
import { AccountTree } from "../components/AccountTree";
import type { ChartOfAccount } from "../types/accounting.types";

export function ChartOfAccountsPage() {
  const { accounts, loading, error, fetchAccounts, setupDefaults } =
    useChartOfAccounts();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAccount, setSelectedAccount] = useState<ChartOfAccount | null>(
    null
  );
  const [settingUp, setSettingUp] = useState(false);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  // Filter accounts
  const filteredAccounts = accounts.filter(
    (acc) =>
      searchQuery === "" ||
      acc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      acc.code.includes(searchQuery)
  );

  const handleSetupDefaults = async () => {
    setSettingUp(true);
    await setupDefaults();
    setSettingUp(false);
  };

  const accountTypeLabels = {
    asset: "أصول",
    liability: "خصوم",
    equity: "حقوق ملكية",
    revenue: "إيرادات",
    expense: "مصروفات",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-primary to-blue-600 text-white shadow-lg shadow-primary/30">
              <BookOpen className="w-6 h-6" />
            </div>
            دليل الحسابات
          </h1>
          <p className="text-gray-500 mt-1">إدارة شجرة الحسابات المحاسبية</p>
        </div>
        <div className="flex gap-2">
          {accounts.length === 0 && !loading && (
            <Button
              variant="outline"
              onClick={handleSetupDefaults}
              disabled={settingUp}
              className="gap-2"
            >
              <Settings className="w-4 h-4" />
              {settingUp ? "جاري الإنشاء..." : "إنشاء الحسابات الافتراضية"}
            </Button>
          )}
          <Button variant="outline" onClick={fetchAccounts} disabled={loading}>
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            حساب جديد
          </Button>
        </div>
      </div>

      {/* Search */}
      <Card className="border-0 shadow-lg">
        <CardContent className="py-4">
          <div className="relative max-w-md">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="ابحث بالاسم أو الرمز..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Accounts Tree */}
        <div className="lg:col-span-2">
          {loading && accounts.length === 0 ? (
            <Card className="border-0 shadow-lg">
              <CardContent className="py-12 text-center">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-gray-500">جاري تحميل الحسابات...</p>
              </CardContent>
            </Card>
          ) : error ? (
            <Card className="border-0 shadow-lg">
              <CardContent className="py-12 text-center text-red-500">
                <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>{error}</p>
              </CardContent>
            </Card>
          ) : accounts.length === 0 ? (
            <Card className="border-0 shadow-lg">
              <CardContent className="py-12 text-center">
                <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-semibold mb-2">لا توجد حسابات</h3>
                <p className="text-gray-500 mb-4">
                  يمكنك إنشاء دليل حسابات افتراضي أو إضافة حسابات يدوياً
                </p>
                <Button onClick={handleSetupDefaults} disabled={settingUp}>
                  إنشاء الحسابات الافتراضية
                </Button>
              </CardContent>
            </Card>
          ) : (
            <AccountTree
              accounts={filteredAccounts}
              onSelect={setSelectedAccount}
              selectedId={selectedAccount?.id}
            />
          )}
        </div>

        {/* Account Details */}
        <div>
          {selectedAccount ? (
            <Card className="border-0 shadow-lg sticky top-6">
              <CardHeader>
                <CardTitle className="text-lg">تفاصيل الحساب</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-xs text-gray-500">الرمز</label>
                  <p className="font-mono text-lg">{selectedAccount.code}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500">الاسم</label>
                  <p className="font-semibold">{selectedAccount.name}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500">النوع</label>
                  <p>{accountTypeLabels[selectedAccount.account_type]}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500">
                    الرصيد الطبيعي
                  </label>
                  <p>
                    {selectedAccount.normal_balance === "debit"
                      ? "مدين"
                      : "دائن"}
                  </p>
                </div>
                {selectedAccount.parent_name && (
                  <div>
                    <label className="text-xs text-gray-500">الحساب الأب</label>
                    <p>{selectedAccount.parent_name}</p>
                  </div>
                )}
                <div className="pt-4 border-t">
                  <label className="text-xs text-gray-500">الرصيد الحالي</label>
                  <p className="text-2xl font-bold text-primary">
                    {parseFloat(
                      selectedAccount.current_balance
                    ).toLocaleString()}{" "}
                    ر.س
                  </p>
                </div>
                {selectedAccount.description && (
                  <div>
                    <label className="text-xs text-gray-500">الوصف</label>
                    <p className="text-sm text-gray-600">
                      {selectedAccount.description}
                    </p>
                  </div>
                )}
                <div className="flex gap-2 pt-4">
                  <Button size="sm" variant="outline" className="flex-1">
                    دفتر الأستاذ
                  </Button>
                  {!selectedAccount.is_system && (
                    <Button size="sm" variant="outline" className="flex-1">
                      تعديل
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-0 shadow-lg">
              <CardContent className="py-12 text-center text-gray-400">
                <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-30" />
                <p>اختر حساباً لعرض تفاصيله</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

export default ChartOfAccountsPage;

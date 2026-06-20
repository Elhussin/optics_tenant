// features/accounting/components/FinancialReportCard.tsx
/**
 * بطاقات التقارير المالية
 */

"use client";

import React from "react";
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/shared/components/shadcn/ui/card";
import type {
  TrialBalance,
  IncomeStatement,
  BalanceSheet,
} from "../types/accounting.types";
import { RevenueExpenseChart, AssetDistributionChart } from "./AccountingCharts";

// Trial Balance Card
export function TrialBalanceCard({ data }: { data: TrialBalance }) {
  // Handle both API response formats
  const accounts = data.accounts || data.items || [];
  const isBalanced = data.totals?.is_balanced ?? data.is_balanced ?? true;
  const totalDebit = data.totals?.debit ?? data.total_debit ?? 0;
  const totalCredit = data.totals?.credit ?? data.total_credit ?? 0;

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            ميزان المراجعة
          </span>
          <span
            className={`text-sm px-2 py-1 rounded ${
              isBalanced
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {isBalanced ? "متوازن" : "غير متوازن"}
          </span>
        </CardTitle>
        <p className="text-sm text-gray-500">بتاريخ {data.as_of_date}</p>
      </CardHeader>

      <CardContent>
        {accounts.length === 0 ? (
          <div className="py-8 text-center text-gray-400">
            <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>لا توجد بيانات</p>
          </div>
        ) : (
          <div className="max-h-[400px] overflow-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-white dark:bg-gray-900">
                <tr className="border-b">
                  <th className="text-right py-2 font-semibold">الحساب</th>
                  <th className="text-left py-2 font-semibold w-28">مدين</th>
                  <th className="text-left py-2 font-semibold w-28">دائن</th>
                </tr>
              </thead>
              <tbody>
                {accounts.map((item, index) => (
                  <tr
                    key={item.account_code || index}
                    className="border-b hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <td className="py-2">
                      <span className="text-xs text-gray-400 mr-2">
                        {item.account_code}
                      </span>
                      {item.account_name}
                    </td>
                    <td className="py-2 text-left">
                      {Number(item.debit) > 0 && (
                        <span>{Number(item.debit).toLocaleString()}</span>
                      )}
                    </td>
                    <td className="py-2 text-left">
                      {Number(item.credit) > 0 && (
                        <span>{Number(item.credit).toLocaleString()}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="sticky bottom-0 bg-gray-100 dark:bg-gray-800 font-bold">
                <tr>
                  <td className="py-3">المجموع</td>
                  <td className="py-3 text-left">
                    {Number(totalDebit).toLocaleString()}
                  </td>
                  <td className="py-3 text-left">
                    {Number(totalCredit).toLocaleString()}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Income Statement Card
export function IncomeStatementCard({ data }: { data: IncomeStatement }) {
  const netIncome = parseFloat(data.net_income);
  const isProfit = netIncome >= 0;

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          {isProfit ? (
            <TrendingUp className="w-5 h-5 text-green-500" />
          ) : (
            <TrendingDown className="w-5 h-5 text-red-500" />
          )}
          قائمة الدخل
        </CardTitle>
        <p className="text-sm text-gray-500">
          من {data.period.start_date} إلى {data.period.end_date}
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Revenue */}
        <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <h4 className="font-semibold text-green-700 dark:text-green-400 mb-2">
            {data.revenue.title}
          </h4>
          {data.revenue.items.map((item) => (
            <div
              key={item.account_id}
              className="flex justify-between text-sm py-1"
            >
              <span>{item.account_name}</span>
              <span>{parseFloat(item.amount).toLocaleString()}</span>
            </div>
          ))}
          <div className="flex justify-between font-bold text-green-700 border-t border-green-200 pt-2 mt-2">
            <span>إجمالي الإيرادات</span>
            <span>{parseFloat(data.revenue.total).toLocaleString()}</span>
          </div>
        </div>

        {/* Cost of Goods */}
        {data.cost_of_goods.items.length > 0 && (
          <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
            <h4 className="font-semibold text-orange-700 dark:text-orange-400 mb-2">
              {data.cost_of_goods.title}
            </h4>
            {data.cost_of_goods.items.map((item) => (
              <div
                key={item.account_id}
                className="flex justify-between text-sm py-1"
              >
                <span>{item.account_name}</span>
                <span>({parseFloat(item.amount).toLocaleString()})</span>
              </div>
            ))}
            <div className="flex justify-between font-bold text-orange-700 border-t border-orange-200 pt-2 mt-2">
              <span>إجمالي تكلفة المبيعات</span>
              <span>
                ({parseFloat(data.cost_of_goods.total).toLocaleString()})
              </span>
            </div>
          </div>
        )}

        {/* Gross Profit */}
        <div className="flex justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg font-bold">
          <span>مجمل الربح</span>
          <span className="text-blue-700">
            {parseFloat(data.gross_profit).toLocaleString()}
          </span>
        </div>

        {/* Operating Expenses */}
        <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
          <h4 className="font-semibold text-red-700 dark:text-red-400 mb-2">
            {data.operating_expenses.title}
          </h4>
          {data.operating_expenses.items.map((item) => (
            <div
              key={item.account_id}
              className="flex justify-between text-sm py-1"
            >
              <span>{item.account_name}</span>
              <span>({parseFloat(item.amount).toLocaleString()})</span>
            </div>
          ))}
          <div className="flex justify-between font-bold text-red-700 border-t border-red-200 pt-2 mt-2">
            <span>إجمالي المصروفات</span>
            <span>
              ({parseFloat(data.operating_expenses.total).toLocaleString()})
            </span>
          </div>
        </div>

        {/* Net Income */}
        <div
          className={`flex justify-between p-4 rounded-lg font-bold text-lg ${
            isProfit
              ? "bg-green-100 dark:bg-green-900/30 text-green-700"
              : "bg-red-100 dark:bg-red-900/30 text-red-700"
          }`}
        >
          <span className="flex items-center gap-2">
            {isProfit ? (
              <ArrowUpRight className="w-5 h-5" />
            ) : (
              <ArrowDownRight className="w-5 h-5" />
            )}
            صافي {isProfit ? "الربح" : "الخسارة"}
          </span>
          <span>{Math.abs(netIncome).toLocaleString()} ر.س</span>
        </div>
      </CardContent>
    </Card>
  );
}

// Balance Sheet Card
export function BalanceSheetCard({ data }: { data: BalanceSheet }) {
  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-primary" />
            الميزانية العمومية
          </span>
          <span
            className={`text-sm px-2 py-1 rounded ${
              data.is_balanced
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {data.is_balanced ? "متوازنة" : "غير متوازنة"}
          </span>
        </CardTitle>
        <p className="text-sm text-gray-500">بتاريخ {data.as_of_date}</p>
      </CardHeader>

      <CardContent>
        <div className="grid md:grid-cols-2 gap-6">
          {/* Assets Column */}
          <div className="space-y-4">
            <h3 className="font-bold text-lg text-blue-600 border-b border-blue-200 pb-2">
              الأصول
            </h3>

            {/* Current Assets */}
            <div className="space-y-1">
              <h4 className="font-semibold text-sm text-gray-600">
                {data.assets.current.title}
              </h4>
              {data.assets.current.items.map((item) => (
                <div
                  key={item.account_id}
                  className="flex justify-between text-sm py-1 pr-4"
                >
                  <span>{item.account_name}</span>
                  <span>{parseFloat(item.amount).toLocaleString()}</span>
                </div>
              ))}
              <div className="flex justify-between text-sm font-medium border-t pt-1">
                <span>إجمالي الأصول المتداولة</span>
                <span>
                  {parseFloat(data.assets.current.total).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Fixed Assets */}
            <div className="space-y-1">
              <h4 className="font-semibold text-sm text-gray-600">
                {data.assets.fixed.title}
              </h4>
              {data.assets.fixed.items.map((item) => (
                <div
                  key={item.account_id}
                  className="flex justify-between text-sm py-1 pr-4"
                >
                  <span>{item.account_name}</span>
                  <span>{parseFloat(item.amount).toLocaleString()}</span>
                </div>
              ))}
              <div className="flex justify-between text-sm font-medium border-t pt-1">
                <span>إجمالي الأصول الثابتة</span>
                <span>
                  {parseFloat(data.assets.fixed.total).toLocaleString()}
                </span>
              </div>
            </div>

            <div className="flex justify-between font-bold text-blue-700 bg-blue-50 p-3 rounded-lg">
              <span>إجمالي الأصول</span>
              <span>{parseFloat(data.assets.total).toLocaleString()}</span>
            </div>
          </div>

          {/* Liabilities & Equity Column */}
          <div className="space-y-4">
            <h3 className="font-bold text-lg text-red-600 border-b border-red-200 pb-2">
              الخصوم وحقوق الملكية
            </h3>

            {/* Current Liabilities */}
            <div className="space-y-1">
              <h4 className="font-semibold text-sm text-gray-600">
                {data.liabilities.current.title}
              </h4>
              {data.liabilities.current.items.map((item) => (
                <div
                  key={item.account_id}
                  className="flex justify-between text-sm py-1 pr-4"
                >
                  <span>{item.account_name}</span>
                  <span>{parseFloat(item.amount).toLocaleString()}</span>
                </div>
              ))}
              <div className="flex justify-between text-sm font-medium border-t pt-1">
                <span>إجمالي الخصوم المتداولة</span>
                <span>
                  {parseFloat(data.liabilities.current.total).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Equity */}
            <div className="space-y-1">
              <h4 className="font-semibold text-sm text-gray-600">
                {data.equity.title}
              </h4>
              {data.equity.items.map((item) => (
                <div
                  key={item.account_id}
                  className="flex justify-between text-sm py-1 pr-4"
                >
                  <span>{item.account_name}</span>
                  <span>{parseFloat(item.amount).toLocaleString()}</span>
                </div>
              ))}
              <div className="flex justify-between text-sm font-medium border-t pt-1">
                <span>إجمالي حقوق الملكية</span>
                <span>{parseFloat(data.equity.total).toLocaleString()}</span>
              </div>
            </div>

            <div className="flex justify-between font-bold text-red-700 bg-red-50 p-3 rounded-lg">
              <span>الإجمالي</span>
              <span>
                {parseFloat(data.total_liabilities_equity).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

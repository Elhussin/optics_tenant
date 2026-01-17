// features/wholesale/components/CustomerStatementTable.tsx
/**
 * جدول كشف حساب العميل
 */

"use client";

import React, { useMemo } from "react";
import {
  FileText,
  ArrowUpCircle,
  ArrowDownCircle,
  Calendar,
  Download,
  Printer,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/src/shared/components/shadcn/ui/card";
import { Button } from "@/src/shared/components/shadcn/ui/button";
import type {
  CustomerStatement,
  CustomerStatementTransaction,
} from "../types/wholesale.types";

interface CustomerStatementTableProps {
  statement: CustomerStatement | null;
  loading?: boolean;
  onExport?: () => void;
  onPrint?: () => void;
}

export function CustomerStatementTable({
  statement,
  loading,
  onExport,
  onPrint,
}: CustomerStatementTableProps) {
  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString("ar-SA", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const formatCurrency = (value: string) => {
    const num = parseFloat(value);
    return num.toLocaleString("ar-SA", { minimumFractionDigits: 2 });
  };

  if (loading) {
    return (
      <Card className="border-0 shadow-lg">
        <CardContent className="py-12">
          <div className="flex flex-col items-center justify-center">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-gray-500">جاري تحميل كشف الحساب...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!statement) {
    return (
      <Card className="border-0 shadow-lg">
        <CardContent className="py-12">
          <div className="flex flex-col items-center justify-center text-gray-400">
            <FileText className="w-16 h-16 mb-4 opacity-30" />
            <p>اختر عميلاً وفترة لعرض كشف الحساب</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              كشف حساب العميل
            </CardTitle>
            <CardDescription className="mt-1">
              {statement.customer.name}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            {onExport && (
              <Button variant="outline" size="sm" onClick={onExport}>
                <Download className="w-4 h-4 ml-2" />
                تصدير
              </Button>
            )}
            {onPrint && (
              <Button variant="outline" size="sm" onClick={onPrint}>
                <Printer className="w-4 h-4 ml-2" />
                طباعة
              </Button>
            )}
          </div>
        </div>

        {/* Period Info */}
        {(statement.period.start_date || statement.period.end_date) && (
          <div className="flex items-center gap-2 mt-3 text-sm text-gray-500">
            <Calendar className="w-4 h-4" />
            <span>
              {statement.period.start_date &&
                formatDate(statement.period.start_date)}
              {statement.period.start_date &&
                statement.period.end_date &&
                " - "}
              {statement.period.end_date &&
                formatDate(statement.period.end_date)}
            </span>
          </div>
        )}
      </CardHeader>

      <CardContent className="p-0">
        {/* Opening Balance */}
        <div className="flex justify-between items-center px-6 py-3 bg-gray-50 dark:bg-gray-800/50 border-b">
          <span className="font-medium">الرصيد الافتتاحي</span>
          <span className="font-bold text-lg">
            {formatCurrency(statement.opening_balance)} ر.س
          </span>
        </div>

        {/* Transactions Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-gray-50/50 dark:bg-gray-800/30 text-sm">
                <th className="text-right py-3 px-4 font-semibold">التاريخ</th>
                <th className="text-right py-3 px-4 font-semibold">النوع</th>
                <th className="text-right py-3 px-4 font-semibold">المرجع</th>
                <th className="text-left py-3 px-4 font-semibold">مدين</th>
                <th className="text-left py-3 px-4 font-semibold">دائن</th>
                <th className="text-left py-3 px-4 font-semibold">الرصيد</th>
              </tr>
            </thead>
            <tbody>
              {statement.transactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-400">
                    لا توجد حركات في هذه الفترة
                  </td>
                </tr>
              ) : (
                statement.transactions.map((tx, index) => (
                  <tr
                    key={index}
                    className="border-b hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    <td className="py-3 px-4 text-sm">{formatDate(tx.date)}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        {tx.type === "invoice" ? (
                          <>
                            <ArrowUpCircle className="w-4 h-4 text-red-500" />
                            <span className="text-sm">فاتورة</span>
                          </>
                        ) : (
                          <>
                            <ArrowDownCircle className="w-4 h-4 text-green-500" />
                            <span className="text-sm">دفعة</span>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm font-mono text-primary">
                      {tx.reference}
                    </td>
                    <td className="py-3 px-4 text-left">
                      {parseFloat(tx.debit) > 0 && (
                        <span className="text-red-600 font-medium">
                          {formatCurrency(tx.debit)}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-left">
                      {parseFloat(tx.credit) > 0 && (
                        <span className="text-green-600 font-medium">
                          {formatCurrency(tx.credit)}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-left font-bold">
                      {formatCurrency(tx.balance)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Closing Balance & Summary */}
        <div className="px-6 py-4 bg-gradient-to-r from-primary/5 to-blue-500/5 border-t">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <div className="text-xs text-gray-500 mb-1">إجمالي الفواتير</div>
              <div className="text-lg font-bold text-red-600">
                {formatCurrency(statement.summary.total_invoices)} ر.س
              </div>
            </div>
            <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="text-xs text-gray-500 mb-1">إجمالي الدفعات</div>
              <div className="text-lg font-bold text-green-600">
                {formatCurrency(statement.summary.total_payments)} ر.س
              </div>
            </div>
            <div className="text-center p-3 bg-primary/10 rounded-lg">
              <div className="text-xs text-gray-500 mb-1">الرصيد الختامي</div>
              <div className="text-lg font-bold text-primary">
                {formatCurrency(statement.closing_balance)} ر.س
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default CustomerStatementTable;

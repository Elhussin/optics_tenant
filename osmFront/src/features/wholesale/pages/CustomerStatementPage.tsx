// features/wholesale/pages/CustomerStatementPage.tsx
/**
 * صفحة كشف حساب العميل
 */

"use client";

import React, { useEffect, useState } from "react";
import {
  FileText,
  ArrowRight,
  Calendar,
  Download,
  Printer,
  RefreshCw,
} from "lucide-react";
import { Card, CardContent } from "@/src/shared/components/shadcn/ui/card";
import { Button } from "@/src/shared/components/shadcn/ui/button";
import { Input } from "@/src/shared/components/shadcn/ui/input";
import { useCustomerStatement } from "../hooks/useWholesale";
import { CustomerStatementTable } from "../components/CustomerStatementTable";
import { CustomerCreditCard } from "../components/CustomerCreditCard";
import { Link, useRouter } from "@/src/app/i18n/navigation";
import type { WholesaleCustomer } from "../types/wholesale.types";

interface CustomerStatementPageProps {
  customerId: number;
  customer?: WholesaleCustomer;
}

export function CustomerStatementPage({
  customerId,
  customer,
}: CustomerStatementPageProps) {
  const router = useRouter();
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const { statement, loading, error, fetchStatement } =
    useCustomerStatement(customerId);

  // Set default dates (last 30 days)
  useEffect(() => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 30);

    setEndDate(end.toISOString().split("T")[0]);
    setStartDate(start.toISOString().split("T")[0]);
  }, []);

  // Fetch statement when dates change
  useEffect(() => {
    if (customerId && startDate && endDate) {
      fetchStatement(startDate, endDate);
    }
  }, [customerId, startDate, endDate, fetchStatement]);

  const handleExport = () => {
    // Implement PDF/Excel export
    console.log("Exporting statement...");
  };

  const handlePrint = () => {
    window.print();
  };

  const handleRefresh = () => {
    fetchStatement(startDate, endDate);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="gap-2"
          >
            <ArrowRight className="w-4 h-4" />
            رجوع
          </Button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-3">
              <div className="p-3 rounded-xl bg-gradient-to-br from-primary to-blue-600 text-white shadow-lg shadow-primary/30">
                <FileText className="w-6 h-6" />
              </div>
              كشف الحساب
            </h1>
            {customer && (
              <p className="text-gray-500 mt-1">
                {customer.first_name} {customer.last_name}
              </p>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={loading}
          >
            <RefreshCw
              className={`w-4 h-4 ml-2 ${loading ? "animate-spin" : ""}`}
            />
            تحديث
          </Button>
        </div>
      </div>

      {/* Date Filters */}
      <Card className="border-0 shadow-lg">
        <CardContent className="py-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-500">الفترة:</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm">من</span>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-40"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm">إلى</span>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-40"
              />
            </div>

            {/* Quick Filters */}
            <div className="flex gap-1 mr-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const end = new Date();
                  const start = new Date();
                  start.setDate(1);
                  setStartDate(start.toISOString().split("T")[0]);
                  setEndDate(end.toISOString().split("T")[0]);
                }}
              >
                هذا الشهر
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const end = new Date();
                  const start = new Date();
                  start.setDate(start.getDate() - 90);
                  setStartDate(start.toISOString().split("T")[0]);
                  setEndDate(end.toISOString().split("T")[0]);
                }}
              >
                آخر 3 أشهر
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const end = new Date();
                  const start = new Date(end.getFullYear(), 0, 1);
                  setStartDate(start.toISOString().split("T")[0]);
                  setEndDate(end.toISOString().split("T")[0]);
                }}
              >
                هذا العام
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content Layout */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Statement Table */}
        <div className="lg:col-span-2">
          <CustomerStatementTable
            statement={statement}
            loading={loading}
            onExport={handleExport}
            onPrint={handlePrint}
          />
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Customer Credit Info */}
          {customer && <CustomerCreditCard customer={customer} />}

          {/* Summary Card */}
          {statement && (
            <Card className="border-0 shadow-lg">
              <CardContent className="p-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-primary" />
                  ملخص الحركة
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">عدد الفواتير</span>
                    <span className="font-medium">
                      {
                        statement.transactions.filter(
                          (t) => t.type === "invoice"
                        ).length
                      }
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">عدد الدفعات</span>
                    <span className="font-medium">
                      {
                        statement.transactions.filter(
                          (t) => t.type === "payment"
                        ).length
                      }
                    </span>
                  </div>
                  <div className="flex justify-between pt-2 border-t">
                    <span className="text-gray-500">إجمالي المديونية</span>
                    <span className="font-bold text-red-600">
                      {parseFloat(
                        statement.summary.total_invoices
                      ).toLocaleString()}{" "}
                      ر.س
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">إجمالي السداد</span>
                    <span className="font-bold text-green-600">
                      {parseFloat(
                        statement.summary.total_payments
                      ).toLocaleString()}{" "}
                      ر.س
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quick Actions */}
          <Card className="border-0 shadow-lg print:hidden">
            <CardContent className="p-4">
              <h3 className="font-semibold mb-3">إجراءات</h3>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2"
                  onClick={handleExport}
                >
                  <Download className="w-4 h-4" />
                  تصدير PDF
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2"
                  onClick={handlePrint}
                >
                  <Printer className="w-4 h-4" />
                  طباعة
                </Button>
                <Link
                  href={`/dashboard/wholesale/orders/create?customer=${customerId}`}
                >
                  <Button
                    className="w-full justify-start gap-2"
                    variant="default"
                  >
                    طلب جديد
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default CustomerStatementPage;

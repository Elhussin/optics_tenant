// features/accounting/pages/FinancialReportsPage.tsx
/**
 * صفحة التقارير المالية
 */

"use client";

import React, { useEffect, useState } from "react";
import {
  BarChart3,
  Calendar,
  Download,
  Printer,
  RefreshCw,
  FileSpreadsheet,
  TrendingUp,
  DollarSign,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/shared/components/shadcn/ui/card";
import { Button } from "@/src/shared/components/shadcn/ui/button";
import { Input } from "@/src/shared/components/shadcn/ui/input";
import { useFinancialReports } from "../hooks/useAccounting";
import { exportToPDF } from "@/src/shared/utils/exportPdf";
import {
  TrialBalanceCard,
  IncomeStatementCard,
  BalanceSheetCard,
} from "../components/FinancialReportCard";
import type {
  TrialBalance,
  IncomeStatement,
  BalanceSheet,
} from "../types/accounting.types";

type ReportType = "trial-balance" | "income-statement" | "balance-sheet";

const reportTabs: { id: ReportType; label: string; icon: React.ReactNode }[] = [
  {
    id: "trial-balance",
    label: "ميزان المراجعة",
    icon: <FileSpreadsheet className="w-4 h-4" />,
  },
  {
    id: "income-statement",
    label: "قائمة الدخل",
    icon: <TrendingUp className="w-4 h-4" />,
  },
  {
    id: "balance-sheet",
    label: "الميزانية العمومية",
    icon: <DollarSign className="w-4 h-4" />,
  },
];

export function FinancialReportsPage() {
  const {
    loading,
    error,
    getTrialBalance,
    getIncomeStatement,
    getBalanceSheet,
  } = useFinancialReports();

  const [activeTab, setActiveTab] = useState<ReportType>("trial-balance");
  const [asOfDate, setAsOfDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setMonth(0);
    date.setDate(1);
    return date.toISOString().split("T")[0];
  });
  const [endDate, setEndDate] = useState(
    new Date().toISOString().split("T")[0],
  );

  // Report data
  const [trialBalance, setTrialBalance] = useState<TrialBalance | null>(null);
  const [incomeStatement, setIncomeStatement] =
    useState<IncomeStatement | null>(null);
  const [balanceSheet, setBalanceSheet] = useState<BalanceSheet | null>(null);

  // Fetch report based on active tab
  const fetchReport = async () => {
    switch (activeTab) {
      case "trial-balance":
        const tb = await getTrialBalance(asOfDate);
        setTrialBalance(tb);
        break;
      case "income-statement":
        const is = await getIncomeStatement(startDate, endDate);
        setIncomeStatement(is);
        break;
      case "balance-sheet":
        const bs = await getBalanceSheet(asOfDate);
        setBalanceSheet(bs);
        break;
    }
  };

  useEffect(() => {
    fetchReport();
  }, [activeTab]);

  const handlePrint = () => {
    window.print();
  };

  const handleExportPDF = async () => {
    await exportToPDF("report-container", `Financial-Report-${activeTab}.pdf`);
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
            التقارير المالية
          </h1>
          <p className="text-gray-500 mt-1">عرض وطباعة التقارير المحاسبية</p>
        </div>
        <div className="flex gap-2 print:hidden">
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="w-4 h-4 ml-2" />
            طباعة
          </Button>
          <Button variant="outline" onClick={handleExportPDF}>
            <Download className="w-4 h-4 ml-2" />
            تصدير
          </Button>
        </div>
      </div>

      {/* Report Tabs */}
      <Card className="border-0 shadow-lg print:hidden">
        <CardContent className="py-4">
          <div className="flex flex-wrap gap-2">
            {reportTabs.map((tab) => (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? "default" : "outline"}
                onClick={() => setActiveTab(tab.id)}
                className="gap-2"
              >
                {tab.icon}
                {tab.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Date Filters */}
      <Card className="border-0 shadow-lg print:hidden">
        <CardContent className="py-4">
          <div className="flex flex-wrap items-center gap-4">
            <Calendar className="w-4 h-4 text-gray-400" />

            {activeTab === "income-statement" ? (
              <>
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
              </>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-sm">بتاريخ</span>
                <Input
                  type="date"
                  value={asOfDate}
                  onChange={(e) => setAsOfDate(e.target.value)}
                  className="w-40"
                />
              </div>
            )}

            <Button onClick={fetchReport} disabled={loading} className="gap-2">
              <RefreshCw
                className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
              />
              تحديث
            </Button>

            {/* Quick Filters */}
            <div className="flex gap-1 mr-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const now = new Date();
                  const start = new Date(now.getFullYear(), now.getMonth(), 1);
                  setStartDate(start.toISOString().split("T")[0]);
                  setEndDate(now.toISOString().split("T")[0]);
                  setAsOfDate(now.toISOString().split("T")[0]);
                }}
              >
                هذا الشهر
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const now = new Date();
                  const start = new Date(now.getFullYear(), 0, 1);
                  setStartDate(start.toISOString().split("T")[0]);
                  setEndDate(now.toISOString().split("T")[0]);
                  setAsOfDate(now.toISOString().split("T")[0]);
                }}
              >
                هذا العام
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Report Content */}
      <div id="report-container" className="pt-4 bg-white dark:bg-gray-900 rounded-xl">
        {loading ? (
          <div className="py-20 text-center">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-500">جاري تحميل التقرير...</p>
          </div>
        ) : error ? (
          <div className="py-20 text-center text-red-500">
            <p>{error}</p>
            <Button variant="outline" onClick={fetchReport} className="mt-4">
              إعادة المحاولة
            </Button>
          </div>
        ) : (
          <div className="animate-fade-in">
            {activeTab === "trial-balance" && trialBalance && (
              <TrialBalanceCard data={trialBalance} />
            )}
            {activeTab === "income-statement" && incomeStatement && (
              <IncomeStatementCard data={incomeStatement} />
            )}
            {activeTab === "balance-sheet" && balanceSheet && (
              <BalanceSheetCard data={balanceSheet} />
            )}
            
            {!trialBalance && activeTab === "trial-balance" && (
              <Card className="border-0 shadow-lg">
                <CardContent className="py-12 text-center text-gray-400">
                  <FileSpreadsheet className="w-12 h-12 mx-auto mb-4 opacity-30" />
                  <p>اضغط &quot;تحديث&quot; لعرض التقرير</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default FinancialReportsPage;

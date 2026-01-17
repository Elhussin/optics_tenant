// features/reports/pages/ReceivablesReportPage.tsx
/**
 * صفحة تقرير الذمم المدينة
 */

"use client";

import React, { useEffect, useState } from "react";
import {
  Clock,
  RefreshCw,
  AlertTriangle,
  Download,
  Filter,
  Phone,
  User,
  FileSpreadsheet,
} from "lucide-react";
import { Card, CardContent } from "@/src/shared/components/shadcn/ui/card";
import { Button } from "@/src/shared/components/shadcn/ui/button";
import { useReceivablesReport, useReportExport } from "../hooks/useReports";
import { StatCard, ReportSection } from "../components/ReportCard";
import { DonutChart } from "../components/ReportChart";

const customerTypeLabels = {
  retail: "تجزئة",
  wholesale: "جملة",
  partner: "شريك/تأمين",
};

const customerTypeFilters = [
  { value: "all", label: "الكل" },
  { value: "retail", label: "تجزئة" },
  { value: "wholesale", label: "جملة" },
  { value: "partner", label: "شريك/تأمين" },
];

export function ReceivablesReportPage() {
  const { report, loading, error, fetchReport } = useReceivablesReport();
  const { loading: exportLoading, exportToExcel } = useReportExport();
  const [customerType, setCustomerType] = useState("all");

  useEffect(() => {
    fetchReport(undefined, customerType);
  }, [fetchReport, customerType]);

  // Prepare aging chart data
  const agingData = report
    ? [
        {
          label: "حالي",
          value: parseFloat(report.totals.current),
          color: "#10B981",
        },
        {
          label: "1-30 يوم",
          value: parseFloat(report.totals.days_1_30),
          color: "#3B82F6",
        },
        {
          label: "31-60 يوم",
          value: parseFloat(report.totals.days_31_60),
          color: "#F59E0B",
        },
        {
          label: "61-90 يوم",
          value: parseFloat(report.totals.days_61_90),
          color: "#F97316",
        },
        {
          label: "+90 يوم",
          value: parseFloat(report.totals.over_90),
          color: "#EF4444",
        },
      ]
    : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/30">
              <Clock className="w-6 h-6" />
            </div>
            تقرير الذمم المدينة
          </h1>
          <p className="text-gray-500 mt-1">
            تحليل أعمار الديون بتاريخ{" "}
            {report?.as_of_date || new Date().toISOString().split("T")[0]}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={customerType}
              onChange={(e) => setCustomerType(e.target.value)}
              className="px-3 py-2 border rounded-lg bg-white dark:bg-gray-800"
            >
              {customerTypeFilters.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
          <Button
            variant="outline"
            onClick={() => fetchReport(undefined, customerType)}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
          <Button
            variant="outline"
            onClick={() =>
              exportToExcel("receivables", { customer_type: customerType })
            }
            disabled={exportLoading}
          >
            <FileSpreadsheet className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {loading && !report ? (
        <div className="p-12 text-center">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">جاري تحميل التقرير...</p>
        </div>
      ) : report ? (
        <>
          {/* Summary Stats */}
          <div className="grid gap-4 md:grid-cols-5">
            <StatCard
              title="إجمالي المستحق"
              value={`${parseFloat(report.totals.total).toLocaleString()}`}
              subtitle="ر.س"
              colorClass="from-gray-700 to-gray-800"
            />
            <StatCard
              title="حالي"
              value={`${parseFloat(report.totals.current).toLocaleString()}`}
              subtitle="ر.س"
              colorClass="from-green-500 to-green-600"
            />
            <StatCard
              title="1-30 يوم"
              value={`${parseFloat(report.totals.days_1_30).toLocaleString()}`}
              subtitle="ر.س"
              colorClass="from-blue-500 to-blue-600"
            />
            <StatCard
              title="31-60 يوم"
              value={`${parseFloat(report.totals.days_31_60).toLocaleString()}`}
              subtitle="ر.س"
              colorClass="from-yellow-500 to-yellow-600"
            />
            <StatCard
              title="+60 يوم"
              value={`${(
                parseFloat(report.totals.days_61_90) +
                parseFloat(report.totals.over_90)
              ).toLocaleString()}`}
              subtitle="ر.س"
              colorClass="from-red-500 to-red-600"
              icon={<AlertTriangle className="w-6 h-6" />}
            />
          </div>

          {/* Charts & Table */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Aging Chart */}
            <ReportSection title="توزيع الأعمار">
              <div className="flex justify-center py-4">
                <DonutChart
                  data={agingData}
                  size={180}
                  centerLabel="المجموع"
                  centerValue={parseFloat(report.totals.total).toLocaleString()}
                />
              </div>
            </ReportSection>

            {/* Details Table */}
            <div className="lg:col-span-2">
              <ReportSection title="تفاصيل الذمم المدينة">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-gray-50 dark:bg-gray-800">
                        <th className="text-right py-3 px-3 font-semibold">
                          العميل
                        </th>
                        <th className="text-right py-3 px-3 font-semibold">
                          النوع
                        </th>
                        <th className="text-left py-3 px-2 font-semibold text-green-600">
                          حالي
                        </th>
                        <th className="text-left py-3 px-2 font-semibold text-blue-600">
                          1-30
                        </th>
                        <th className="text-left py-3 px-2 font-semibold text-yellow-600">
                          31-60
                        </th>
                        <th className="text-left py-3 px-2 font-semibold text-orange-600">
                          61-90
                        </th>
                        <th className="text-left py-3 px-2 font-semibold text-red-600">
                          +90
                        </th>
                        <th className="text-left py-3 px-3 font-semibold">
                          المجموع
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {report.items.map((item) => (
                        <tr
                          key={item.customer_id}
                          className="border-b hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        >
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4 text-gray-400" />
                              <div>
                                <div className="font-medium">
                                  {item.customer_name}
                                </div>
                                {item.phone && (
                                  <div className="text-xs text-gray-500 flex items-center gap-1">
                                    <Phone className="w-3 h-3" />
                                    {item.phone}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-3">
                            <span
                              className={`text-xs px-2 py-1 rounded-full ${
                                item.customer_type === "wholesale"
                                  ? "bg-purple-100 text-purple-700"
                                  : item.customer_type === "partner"
                                  ? "bg-blue-100 text-blue-700"
                                  : "bg-gray-100 text-gray-700"
                              }`}
                            >
                              {customerTypeLabels[item.customer_type]}
                            </span>
                          </td>
                          <td className="py-3 px-2 text-left text-green-600 font-medium">
                            {parseFloat(item.current) > 0
                              ? parseFloat(item.current).toLocaleString()
                              : "-"}
                          </td>
                          <td className="py-3 px-2 text-left text-blue-600">
                            {parseFloat(item.days_1_30) > 0
                              ? parseFloat(item.days_1_30).toLocaleString()
                              : "-"}
                          </td>
                          <td className="py-3 px-2 text-left text-yellow-600">
                            {parseFloat(item.days_31_60) > 0
                              ? parseFloat(item.days_31_60).toLocaleString()
                              : "-"}
                          </td>
                          <td className="py-3 px-2 text-left text-orange-600">
                            {parseFloat(item.days_61_90) > 0
                              ? parseFloat(item.days_61_90).toLocaleString()
                              : "-"}
                          </td>
                          <td className="py-3 px-2 text-left text-red-600 font-medium">
                            {parseFloat(item.over_90) > 0
                              ? parseFloat(item.over_90).toLocaleString()
                              : "-"}
                          </td>
                          <td className="py-3 px-3 text-left font-bold">
                            {parseFloat(item.total).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="bg-gray-100 dark:bg-gray-800 font-bold">
                        <td colSpan={2} className="py-3 px-3">
                          المجموع
                        </td>
                        <td className="py-3 px-2 text-left text-green-600">
                          {parseFloat(report.totals.current).toLocaleString()}
                        </td>
                        <td className="py-3 px-2 text-left text-blue-600">
                          {parseFloat(report.totals.days_1_30).toLocaleString()}
                        </td>
                        <td className="py-3 px-2 text-left text-yellow-600">
                          {parseFloat(
                            report.totals.days_31_60
                          ).toLocaleString()}
                        </td>
                        <td className="py-3 px-2 text-left text-orange-600">
                          {parseFloat(
                            report.totals.days_61_90
                          ).toLocaleString()}
                        </td>
                        <td className="py-3 px-2 text-left text-red-600">
                          {parseFloat(report.totals.over_90).toLocaleString()}
                        </td>
                        <td className="py-3 px-3 text-left">
                          {parseFloat(report.totals.total).toLocaleString()}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </ReportSection>
            </div>
          </div>
        </>
      ) : error ? (
        <Card className="border-0 shadow-lg">
          <CardContent className="py-12 text-center text-red-500">
            <p>{error}</p>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}

export default ReceivablesReportPage;

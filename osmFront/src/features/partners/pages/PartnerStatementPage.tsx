"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { usePartnerStatement } from "../hooks/usePartners";
import {
  Download,
  Printer,
  ArrowLeft,
  Calendar,
  FileText,
  TrendingDown,
  TrendingUp,
  DollarSign,
} from "lucide-react";
import { GlassCard } from "@/src/shared/components/ui/GlassCard";
import { ActionButton } from "@/src/shared/components/ui/buttons";
import { Badge } from "@/src/shared/components/ui/Badge";
import { EmptyState } from "@/src/shared/components/ui/EmptyState";
import { format } from "date-fns";

export function PartnerStatementPage() {
  const { id } = useParams();
  const router = useRouter();
  const partnerId = Number(id);

  // Date Filters (Default: Current Month)
  const [startDate, setStartDate] = useState(
    format(
      new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      "yyyy-MM-dd",
    ),
  );
  const [endDate, setEndDate] = useState(format(new Date(), "yyyy-MM-dd"));

  const { statement, loading, error, fetchStatement } =
    usePartnerStatement(partnerId);

  useEffect(() => {
    if (partnerId) {
      fetchStatement(startDate, endDate);
    }
  }, [partnerId, startDate, endDate, fetchStatement]);

  if (loading && !statement) {
    return (
      <div className="p-10 text-center animate-pulse">
        جاري تحميل كشف الحساب...
      </div>
    );
  }

  if (!statement && !loading) {
    return (
      <div className="p-10">
        <EmptyState
          type="error"
          title="لا يوجد بيانات"
          description="لم يتم العثور على كشف حساب لهذا الشريك"
          action={
            <ActionButton
              variant="secondary"
              label="عودة"
              onClick={() => router.back()}
            />
          }
        />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      {/* Header */}
      <GlassCard className="border-none" padding="sm">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-xl text-primary">
              <FileText size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-main">كشف حساب شريك</h1>
              <p className="text-secondary">
                {statement?.partner.name} •{" "}
                {format(new Date(startDate), "dd/MM/yyyy")} -{" "}
                {format(new Date(endDate), "dd/MM/yyyy")}
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <ActionButton
              variant="secondary"
              icon={<Printer size={18} />}
              label="طباعة"
              onClick={() => window.print()}
            />
            <ActionButton
              variant="secondary"
              icon={<ArrowLeft size={18} />}
              label="عودة"
              onClick={() => router.back()}
            />
          </div>
        </div>
      </GlassCard>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-end bg-white/50 dark:bg-gray-800/50 p-4 rounded-xl border border-border-main/50 no-print">
        <div className="space-y-1">
          <label className="text-sm font-medium text-secondary">من تاريخ</label>
          <div className="relative">
            <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary" />
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-white dark:bg-gray-900 border border-border-main/50 rounded-lg py-2 pr-10 pl-4 w-40 text-sm focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-secondary">
            إلى تاريخ
          </label>
          <div className="relative">
            <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary" />
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-white dark:bg-gray-900 border border-border-main/50 rounded-lg py-2 pr-10 pl-4 w-40 text-sm focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>
        <div className="mr-auto flex gap-2">
          {/* Export Actions could go here */}
        </div>
      </div>

      {/* Summary Cards */}
      {statement && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <SummaryCard
            title="الرصيد الافتتاحي"
            value={statement.opening_balance}
            color="neutral"
          />
          <SummaryCard
            title="إجمالي المطالبات (مدين)"
            value={statement.summary.total_claims}
            icon={<TrendingUp size={20} />}
            color="blue"
          />
          <SummaryCard
            title="إجمالي المدفوعات (دائن)"
            value={statement.summary.total_payments}
            icon={<TrendingDown size={20} />}
            color="green"
          />
          <SummaryCard
            title="الرصيد الختامي"
            value={statement.closing_balance}
            icon={<DollarSign size={20} />}
            color={Number(statement.closing_balance) > 0 ? "red" : "green"}
            highlight
          />
        </div>
      )}

      {/* Transactions Table */}
      <GlassCard className="overflow-hidden" padding="none">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50/50 dark:bg-gray-800/50 border-b border-border-main/50">
              <tr>
                <th className="px-6 py-4 text-right font-semibold text-secondary">
                  التاريخ
                </th>
                <th className="px-6 py-4 text-right font-semibold text-secondary">
                  نوع الحركة
                </th>
                <th className="px-6 py-4 text-right font-semibold text-secondary">
                  المعرف
                </th>
                <th className="px-6 py-4 text-right font-semibold text-secondary">
                  مدين (لنا)
                </th>
                <th className="px-6 py-4 text-right font-semibold text-secondary">
                  دائن (علينا)
                </th>
                <th className="px-6 py-4 text-right font-semibold text-secondary">
                  الرصيد
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-main/20">
              {statement?.transactions.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-secondary"
                  >
                    لا توجد حركات خلال هذه الفترة
                  </td>
                </tr>
              ) : (
                statement?.transactions.map((trx, idx) => (
                  <tr
                    key={idx}
                    className="hover:bg-primary/5 transition-colors"
                  >
                    <td className="px-6 py-4 font-mono text-secondary">
                      {format(new Date(trx.date), "yyyy-MM-dd")}
                    </td>
                    <td className="px-6 py-4">
                      <Badge
                        variant={trx.type === "claim" ? "info" : "success"}
                      >
                        {trx.type === "claim" ? "مطالبة" : "دفعة"}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 font-medium">{trx.reference}</td>
                    <td className="px-6 py-4 font-bold text-main">
                      {Number(trx.debit) > 0
                        ? Number(trx.debit).toLocaleString()
                        : "-"}
                    </td>
                    <td className="px-6 py-4 font-bold text-green-600">
                      {Number(trx.credit) > 0
                        ? Number(trx.credit).toLocaleString()
                        : "-"}
                    </td>
                    <td
                      className={`px-6 py-4 font-bold ${Number(trx.balance) > 0
                          ? "text-red-500"
                          : "text-green-500"
                        }`}
                      dir="ltr"
                    >
                      {Number(trx.balance).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
}

function SummaryCard({ title, value, color, icon, highlight }: any) {
  const bgColors: any = {
    blue: "bg-blue-500/10 text-blue-600",
    green: "bg-emerald-500/10 text-emerald-600",
    red: "bg-red-500/10 text-red-600",
    neutral: "bg-gray-500/10 text-gray-600",
  };

  return (
    <GlassCard
      className={`relative ${highlight ? "ring-2 ring-primary/20 bg-primary/5" : ""
        }`}
    >
      <div className="space-y-2">
        <div className="flex justify-between items-start">
          <span className="text-sm font-medium text-secondary">{title}</span>
          {icon && (
            <div className={`p-1.5 rounded-lg ${bgColors[color]}`}>{icon}</div>
          )}
        </div>
        <div
          className={`text-2xl font-bold ${color === "red"
              ? "text-red-600"
              : color === "green"
                ? "text-emerald-600"
                : "text-main"
            }`}
        >
          {Number(value).toLocaleString()}
          <span className="text-xs font-normal text-secondary mr-1">ر.س</span>
        </div>
      </div>
    </GlassCard>
  );
}

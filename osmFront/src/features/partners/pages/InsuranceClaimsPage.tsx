// features/partners/pages/InsuranceClaimsPage.tsx
/**
 * صفحة مطالبات التأمين - Premium Redesign
 */

"use client";

import React, { useEffect, useState } from "react";
import {
  FileText,
  Plus,
  Search,
  RefreshCw,
  Eye,
  Send,
  CheckCircle,
  XCircle,
  Calendar,
  Building2,
  Clock,
  DollarSign,
  TrendingUp,
} from "lucide-react";
import { useInsuranceClaims } from "../hooks/usePartners";
import { ClaimStatusBadge } from "../components/ClaimStatusBadge";
import type { InsuranceClaim, ClaimStatus } from "../types/partners.types";
import { GlassCard } from "@/src/shared/components/ui/GlassCard";
import { ActionButton } from "@/src/shared/components/ui/buttons";
import { StatsCard } from "../components/StatsCard";
import { EmptyState } from "@/src/shared/components/ui/EmptyState";
import { cn } from "@/src/shared/utils/cn";
import { motion } from "framer-motion";
import { SkeletonGroup } from "@/src/shared/components/ui/Skeleton";

const statusFilters: { value: ClaimStatus | "all"; label: string }[] = [
  { value: "all", label: "الكل" },
  { value: "pending", label: "قيد الانتظار" },
  { value: "submitted", label: "تم الإرسال" },
  { value: "approved", label: "موافق عليها" },
  { value: "rejected", label: "مرفوضة" },
  { value: "paid", label: "مدفوعة" },
];

export function InsuranceClaimsPage() {
  const {
    claims,
    loading,
    error,
    fetchClaims,
    submitClaim,
    approveClaim,
    rejectClaim,
  } = useInsuranceClaims();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    fetchClaims();
  }, [fetchClaims]);

  // Filter claims
  const filteredClaims = claims.filter((claim) => {
    const matchesSearch =
      searchQuery === "" ||
      claim.claim_number.includes(searchQuery) ||
      claim.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      claim.partner_name.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || claim.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Stats
  const pendingCount = claims.filter((c) => c.status === "pending").length;
  const pendingAmount = claims
    .filter((c) => c.status === "pending" || c.status === "submitted")
    .reduce((sum, c) => sum + parseFloat(c.partner_share || "0"), 0);
  const approvedAmount = claims
    .filter((c) => c.status === "approved" || c.status === "paid")
    .reduce(
      (sum, c) => sum + parseFloat(c.approved_amount || c.partner_share || "0"),
      0,
    );

  const handleSubmit = async (claim: InsuranceClaim) => {
    if (confirm("هل تريد إرسال هذه المطالبة للشريك؟")) {
      await submitClaim(claim.id);
    }
  };

  const handleApprove = async (claim: InsuranceClaim) => {
    const amount = prompt("أدخل المبلغ الموافق عليه:", claim.partner_share);
    if (amount) {
      await approveClaim(claim.id, amount);
    }
  };

  const handleReject = async (claim: InsuranceClaim) => {
    const reason = prompt("أدخل سبب الرفض:");
    if (reason) {
      await rejectClaim(claim.id, reason);
    }
  };

  if (loading && claims.length === 0) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-16 w-full bg-elevated/50 rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <SkeletonGroup type="card" count={4} />
        </div>
        <div className="h-96 w-full bg-elevated/50 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      {/* Header */}
      <GlassCard className="relative border-none overflow-visible" padding="sm">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500/20 to-blue-600/10 text-blue-600 ring-1 ring-blue-500/20">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-main">مطالبات التأمين</h1>
              <p className="text-sm text-secondary">
                إدارة ومتابعة مطالبات التأمين
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <ActionButton
              variant="secondary"
              icon={
                <RefreshCw
                  className={cn("w-4 h-4", loading && "animate-spin")}
                />
              }
              onClick={() => fetchClaims()}
              title="تحديث"
            />
            <ActionButton
              variant="primary"
              icon={<Plus className="w-4 h-4" />}
              label="مطالبة جديدة"
              // Add navigation to create claim page if exists
            />
          </div>
        </div>
      </GlassCard>

      {/* Stats */}
      <div className="grid gap-6 md:grid-cols-4">
        <StatsCard
          title="مطالبات معلقة"
          value={pendingCount}
          icon={<Clock className="w-5 h-5" />}
          color="yellow"
        />
        <StatsCard
          title="مبلغ قيد المطالبة"
          value={pendingAmount.toLocaleString()}
          suffix=" ر.س"
          icon={<DollarSign className="w-5 h-5" />}
          color="blue"
        />
        <StatsCard
          title="مبلغ موافق عليه"
          value={approvedAmount.toLocaleString()}
          suffix=" ر.س"
          icon={<CheckCircle className="w-5 h-5" />}
          color="green"
        />
        <StatsCard
          title="إجمالي المطالبات"
          value={claims.length}
          icon={<TrendingUp className="w-5 h-5" />}
          color="purple"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-center bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm p-4 rounded-xl border border-border-main/50">
        <div className="relative flex-1 w-full">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary" />
          <input
            type="text"
            placeholder="بحث برقم المطالبة أو اسم العميل..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white dark:bg-gray-800 border-none rounded-lg py-2.5 pr-10 pl-4 text-sm focus:ring-2 focus:ring-blue-500/20 transition-all font-medium placeholder:text-gray-400"
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white dark:bg-gray-800 border-none rounded-lg py-2.5 px-4 text-sm focus:ring-2 focus:ring-blue-500/20 transition-all cursor-pointer font-medium w-full sm:w-auto"
          >
            {statusFilters.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Claims Table */}
      {error ? (
        <EmptyState
          type="error"
          title="حدث خطأ"
          description={error}
          action={
            <ActionButton
              variant="outline"
              label="إعادة المحاولة"
              onClick={() => fetchClaims()}
            />
          }
        />
      ) : filteredClaims.length === 0 ? (
        <EmptyState
          type="search"
          title="لا توجد مطالبات"
          description="لم يتم العثور على مطالبات تطابق بحثك"
        />
      ) : (
        <GlassCard className="overflow-hidden p-0" padding="none">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50/50 dark:bg-gray-800/50 border-b border-border-main/50">
                <tr>
                  <th className="text-right py-4 px-6 font-semibold text-secondary">
                    رقم المطالبة
                  </th>
                  <th className="text-right py-4 px-6 font-semibold text-secondary">
                    التاريخ
                  </th>
                  <th className="text-right py-4 px-6 font-semibold text-secondary">
                    الشريك
                  </th>
                  <th className="text-right py-4 px-6 font-semibold text-secondary">
                    العميل
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-secondary">
                    المبلغ
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-secondary">
                    حصة الشريك
                  </th>
                  <th className="text-center py-4 px-6 font-semibold text-secondary">
                    الحالة
                  </th>
                  <th className="text-center py-4 px-6 font-semibold text-secondary">
                    الإجراءات
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-main/20">
                {filteredClaims.map((claim, idx) => (
                  <motion.tr
                    key={claim.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="hover:bg-primary/5 transition-colors"
                  >
                    <td className="py-4 px-6">
                      <span className="font-mono text-primary font-bold">
                        {claim.claim_number}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-1.5 text-secondary">
                        <Calendar className="w-3.5 h-3.5" />
                        {claim.claim_date}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-gray-400" />
                        <span className="font-medium text-main">
                          {claim.partner_name}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6 font-medium text-main">
                      {claim.customer_name}
                    </td>
                    <td className="py-4 px-6 text-left font-medium text-secondary">
                      {parseFloat(claim.total_amount).toLocaleString()}
                    </td>
                    <td className="py-4 px-6 text-left font-bold text-main">
                      {parseFloat(claim.partner_share).toLocaleString()}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <div className="flex justify-center">
                        <ClaimStatusBadge status={claim.status} size="sm" />
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-center gap-2">
                        <ActionButton
                          variant="icon-view"
                          size="sm"
                          icon={<Eye size={16} />}
                          title="عرض التفاصيل"
                        />
                        {claim.status === "pending" && (
                          <ActionButton
                            variant="icon-view"
                            size="sm"
                            icon={<Send size={16} />}
                            className="text-blue-500 hover:bg-blue-500/10"
                            onClick={() => handleSubmit(claim)}
                            title="إرسال"
                          />
                        )}
                        {claim.status === "submitted" && (
                          <>
                            <ActionButton
                              variant="icon-view"
                              size="sm"
                              icon={<CheckCircle size={16} />}
                              className="text-green-500 hover:bg-green-500/10"
                              onClick={() => handleApprove(claim)}
                              title="موافقة"
                            />
                            <ActionButton
                              variant="icon-view"
                              size="sm"
                              icon={<XCircle size={16} />}
                              className="text-red-500 hover:bg-red-500/10"
                              onClick={() => handleReject(claim)}
                              title="رفض"
                            />
                          </>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      )}
    </div>
  );
}

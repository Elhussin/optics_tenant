// features/partners/pages/InsuranceClaimsPage.tsx
/**
 * صفحة مطالبات التأمين
 */

"use client";

import React, { useEffect, useState } from "react";
import {
  FileText,
  Plus,
  Search,
  Filter,
  RefreshCw,
  Eye,
  Send,
  CheckCircle,
  XCircle,
  Calendar,
  AlertCircle,
  Building2,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/shared/components/shadcn/ui/card";
import { Button } from "@/src/shared/components/shadcn/ui/button";
import { Input } from "@/src/shared/components/shadcn/ui/input";
import { useInsuranceClaims } from "../hooks/usePartners";
import { ClaimStatusBadge } from "../components/ClaimStatusBadge";
import type { InsuranceClaim, ClaimStatus } from "../types/partners.types";

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
  const [selectedClaim, setSelectedClaim] = useState<InsuranceClaim | null>(
    null
  );

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
      0
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-primary to-blue-600 text-white shadow-lg shadow-primary/30">
              <FileText className="w-6 h-6" />
            </div>
            مطالبات التأمين
          </h1>
          <p className="text-gray-500 mt-1">إدارة ومتابعة مطالبات التأمين</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => fetchClaims()}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            مطالبة جديدة
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-0 shadow bg-gradient-to-br from-yellow-500 to-yellow-600 text-white">
          <CardContent className="p-4">
            <div className="text-yellow-100 text-sm">مطالبات معلقة</div>
            <div className="text-3xl font-bold">{pendingCount}</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardContent className="p-4">
            <div className="text-blue-100 text-sm">مبلغ قيد المطالبة</div>
            <div className="text-2xl font-bold">
              {pendingAmount.toLocaleString()}
            </div>
            <div className="text-blue-100 text-xs">ر.س</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow bg-gradient-to-br from-green-500 to-green-600 text-white">
          <CardContent className="p-4">
            <div className="text-green-100 text-sm">مبلغ موافق عليه</div>
            <div className="text-2xl font-bold">
              {approvedAmount.toLocaleString()}
            </div>
            <div className="text-green-100 text-xs">ر.س</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <CardContent className="p-4">
            <div className="text-purple-100 text-sm">إجمالي المطالبات</div>
            <div className="text-3xl font-bold">{claims.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-lg">
        <CardContent className="py-4">
          <div className="flex flex-wrap gap-4 items-center">
            {/* Search */}
            <div className="relative flex-1 min-w-[250px]">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="ابحث برقم المطالبة أو اسم العميل..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10"
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border rounded-lg bg-white dark:bg-gray-800"
              >
                {statusFilters.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Claims Table */}
      <Card className="border-0 shadow-lg">
        <CardContent className="p-0">
          {loading && claims.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-500">جاري التحميل...</p>
            </div>
          ) : error ? (
            <div className="p-12 text-center text-red-500">
              <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>{error}</p>
            </div>
          ) : filteredClaims.length === 0 ? (
            <div className="p-12 text-center text-gray-400">
              <FileText className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p>لا توجد مطالبات</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-gray-50 dark:bg-gray-800 text-sm">
                    <th className="text-right py-3 px-4 font-semibold">
                      رقم المطالبة
                    </th>
                    <th className="text-right py-3 px-4 font-semibold">
                      التاريخ
                    </th>
                    <th className="text-right py-3 px-4 font-semibold">
                      الشريك
                    </th>
                    <th className="text-right py-3 px-4 font-semibold">
                      العميل
                    </th>
                    <th className="text-left py-3 px-4 font-semibold">
                      المبلغ
                    </th>
                    <th className="text-left py-3 px-4 font-semibold">
                      حصة الشريك
                    </th>
                    <th className="text-center py-3 px-4 font-semibold">
                      الحالة
                    </th>
                    <th className="text-center py-3 px-4 font-semibold w-32">
                      الإجراءات
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredClaims.map((claim) => (
                    <tr
                      key={claim.id}
                      className="border-b hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <span className="font-mono text-primary font-medium">
                          {claim.claim_number}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-gray-400" />
                          {claim.claim_date}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-gray-400" />
                          <span className="text-sm">{claim.partner_name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm">
                        {claim.customer_name}
                      </td>
                      <td className="py-3 px-4 text-left font-medium">
                        {parseFloat(claim.total_amount).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-left font-bold text-primary">
                        {parseFloat(claim.partner_share).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <ClaimStatusBadge status={claim.status} size="sm" />
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedClaim(claim)}
                            title="عرض"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          {claim.status === "pending" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleSubmit(claim)}
                              title="إرسال"
                              className="text-blue-600"
                            >
                              <Send className="w-4 h-4" />
                            </Button>
                          )}
                          {claim.status === "submitted" && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleApprove(claim)}
                                title="موافقة"
                                className="text-green-600"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleReject(claim)}
                                title="رفض"
                                className="text-red-600"
                              >
                                <XCircle className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default InsuranceClaimsPage;

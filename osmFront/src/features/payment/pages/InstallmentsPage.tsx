// features/payment/pages/InstallmentsPage.tsx
/**
 * صفحة متابعة الأقساط
 */

"use client";

import React, { useEffect, useState } from "react";
import {
  Calendar,
  RefreshCw,
  Filter,
  AlertTriangle,
  Clock,
  CheckCircle,
  DollarSign,
  Search,
  AlertCircle,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/shared/components/shadcn/ui/card";
import { Button } from "@/src/shared/components/shadcn/ui/button";
import { Input } from "@/src/shared/components/shadcn/ui/input";
import { useInstallments } from "../hooks/usePayment";
import { InstallmentCard } from "../components/InstallmentCard";
import type { InstallmentStatus } from "../types/payment.types";

const statusFilters: {
  value: InstallmentStatus | "all";
  label: string;
  icon: React.ReactNode;
}[] = [
    { value: "all", label: "الكل", icon: <Calendar className="w-4 h-4" /> },
    { value: "due", label: "مستحق", icon: <Clock className="w-4 h-4" /> },
    {
      value: "overdue",
      label: "متأخر",
      icon: <AlertTriangle className="w-4 h-4" />,
    },
    { value: "pending", label: "معلق", icon: <Calendar className="w-4 h-4" /> },
    { value: "paid", label: "مدفوع", icon: <CheckCircle className="w-4 h-4" /> },
  ];

export function InstallmentsPage() {
  const { installments, loading, error, fetchInstallments, markAsPaid } =
    useInstallments();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchInstallments();
  }, [fetchInstallments]);

  // Filter installments
  const filteredInstallments = installments.filter((inst) => {
    const matchesStatus =
      statusFilter === "all" || (inst.status || 'pending') === statusFilter;
    // Search would work with payment number if available
    return matchesStatus;
  });

  // Stats
  const overdueInstallments = installments.filter(
    (i) => i.status === "overdue"
  );
  const dueInstallments = installments.filter((i) => i.status === "due");
  const overdueAmount = overdueInstallments.reduce(
    (sum, i) => sum + parseFloat(i.amount || "0"),
    0
  );
  const dueAmount = dueInstallments.reduce(
    (sum, i) => sum + parseFloat(i.amount || "0"),
    0
  );
  const paidThisMonth = installments.filter((i) => {
    if (i.status !== "paid" || !i.paid_at) return false;
    const paidDate = new Date(i.paid_at);
    const now = new Date();
    return (
      paidDate.getMonth() === now.getMonth() &&
      paidDate.getFullYear() === now.getFullYear()
    );
  });
  const paidAmount = paidThisMonth.reduce(
    (sum, i) => sum + parseFloat(i.amount || "0"),
    0
  );

  const handleMarkPaid = async (id: number) => {
    if (confirm("هل تريد تسجيل هذا القسط كمدفوع؟")) {
      await markAsPaid(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-primary to-blue-600 text-white shadow-lg shadow-primary/30">
              <Calendar className="w-6 h-6" />
            </div>
            متابعة الأقساط
          </h1>
          <p className="text-gray-500 mt-1">إدارة ومتابعة الأقساط المستحقة</p>
        </div>
        <Button
          variant="outline"
          onClick={() => fetchInstallments()}
          disabled={loading}
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-0 shadow bg-gradient-to-br from-red-500 to-red-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-red-100 text-sm">
              <AlertTriangle className="w-4 h-4" />
              أقساط متأخرة
            </div>
            <div className="text-3xl font-bold mt-1">
              {overdueInstallments.length}
            </div>
            <div className="text-red-100 text-sm mt-1">
              {overdueAmount.toLocaleString()} ر.س
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-blue-100 text-sm">
              <Clock className="w-4 h-4" />
              أقساط مستحقة
            </div>
            <div className="text-3xl font-bold mt-1">
              {dueInstallments.length}
            </div>
            <div className="text-blue-100 text-sm mt-1">
              {dueAmount.toLocaleString()} ر.س
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow bg-gradient-to-br from-green-500 to-green-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-green-100 text-sm">
              <CheckCircle className="w-4 h-4" />
              مدفوع هذا الشهر
            </div>
            <div className="text-3xl font-bold mt-1">
              {paidThisMonth.length}
            </div>
            <div className="text-green-100 text-sm mt-1">
              {paidAmount.toLocaleString()} ر.س
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-purple-100 text-sm">
              <DollarSign className="w-4 h-4" />
              إجمالي الأقساط
            </div>
            <div className="text-3xl font-bold mt-1">{installments.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-lg">
        <CardContent className="py-4">
          <div className="flex flex-wrap gap-4 items-center">
            {/* Status Filter Tabs */}
            <div className="flex gap-2">
              {statusFilters.map((filter) => (
                <Button
                  key={filter.value}
                  variant={
                    statusFilter === filter.value ? "default" : "outline"
                  }
                  size="sm"
                  onClick={() => setStatusFilter(filter.value)}
                  className="gap-1"
                >
                  {filter.icon}
                  {filter.label}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Installments List */}
      <Card className="border-0 shadow-lg">
        <CardContent className="py-6">
          {loading && installments.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-500">جاري التحميل...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12 text-red-500">
              <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>{error}</p>
            </div>
          ) : filteredInstallments.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Calendar className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p>لا توجد أقساط</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredInstallments.map((installment) => (
                <InstallmentCard
                  key={installment.id}
                  installment={installment}
                  onMarkPaid={handleMarkPaid}
                  loading={loading}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default InstallmentsPage;

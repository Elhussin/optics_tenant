// features/partners/components/PartnerClaimsTab.tsx
"use client";

import React from "react";
import { FileText, AlertCircle } from "lucide-react";
import { GlassCard } from "@/src/shared/components/ui/GlassCard";
import { EmptyState } from "@/src/shared/components/ui/EmptyState";
import { SkeletonGroup } from "@/src/shared/components/ui/Skeleton";
import { Badge } from "@/src/shared/components/ui/Badge";
import { InsuranceClaim } from "../types/partners.types";
import { format } from "date-fns";
import { useApiForm } from "@/src/shared/hooks/useApiForm";
import { formsConfig } from "@/src/shared/constants/formsConfig";
import { extractArrayData } from "@/src/shared/utils/apiHelpers";

interface PartnerClaimsTabProps {
  partnerId: number;
}

export function PartnerClaimsTab({ partnerId }: PartnerClaimsTabProps) {
  const listAlias = formsConfig["crm-insurance-claims"].listAlias;

  const { query } = useApiForm({
    alias: listAlias!,
    defaultValues: { partner: partnerId },
  });

  const { data, isLoading, error } = query;
  const claims = extractArrayData<InsuranceClaim>(data);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <SkeletonGroup type="list-item" count={5} />
      </div>
    );
  }

  if (error) {
    return (
      <EmptyState
        type="error"
        title="خطأ"
        description={(error as Error).message}
      />
    );
  }

  if (!claims || claims.length === 0) {
    return (
      <EmptyState
        type="search"
        title="لا توجد مطالبات"
        description="لم يتم إنشاء مطالبة لهذا الشريك بعد"
        icon={<FileText className="w-12 h-12 text-gray-400" />}
      />
    );
  }

  const getStatusColor = (
    status: string,
  ): "success" | "danger" | "warning" | "neutral" => {
    switch (status) {
      case "approved":
      case "paid":
        return "success";
      case "rejected":
      case "cancelled":
        return "danger";
      case "partial":
        return "warning";
      default:
        return "neutral";
    }
  };

  return (
    <div className="space-y-4">
      {claims.map((claim) => (
        <GlassCard
          key={claim.id}
          className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between hover:bg-white/5 transition-colors"
        >
          <div className="flex items-start gap-4">
            <div
              className={`p-3 rounded-xl ${
                claim.status === "paid"
                  ? "bg-green-100 text-green-600"
                  : claim.status === "rejected"
                  ? "bg-red-100 text-red-600"
                  : "bg-blue-100 text-blue-600"
              }`}
            >
              <FileText size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-bold text-main">{claim.claim_number}</h4>
                <span className="text-xs text-secondary">
                  ({claim.claim_date})
                </span>
              </div>
              <p className="text-sm text-secondary mb-1">
                الطلب:{" "}
                <span className="font-medium text-main">
                  {claim.order_number}
                </span>{" "}
                • العميل: {claim.customer_name}
              </p>
              {claim.rejection_reason && (
                <div className="flex items-center gap-1 text-xs text-red-500">
                  <AlertCircle size={12} />
                  <span>سبب الرفض: {claim.rejection_reason}</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
            <div className="text-left">
              <div className="text-xs text-secondary">مبلغ المطالبة</div>
              <div className="font-bold text-main">
                {Number(claim.claim_amount).toLocaleString()} ر.س
              </div>
            </div>
            <div className="text-left">
              <div className="text-xs text-secondary">المبلغ المعتمد</div>
              <div
                className={`font-bold ${
                  Number(claim.approved_amount) > 0
                    ? "text-green-600"
                    : "text-gray-400"
                }`}
              >
                {Number(claim.approved_amount).toLocaleString()} ر.س
              </div>
            </div>
            <Badge variant={getStatusColor(claim.status) as any}>
              {claim.status_display}
            </Badge>
          </div>
        </GlassCard>
      ))}
    </div>
  );
}

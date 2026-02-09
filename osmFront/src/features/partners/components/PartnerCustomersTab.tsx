// features/partners/components/PartnerCustomersTab.tsx
"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { useApiForm } from "@/src/shared/hooks/useApiForm";
import { Users, ShieldCheck } from "lucide-react";
import { GlassCard } from "@/src/shared/components/ui/GlassCard";
import { EmptyState } from "@/src/shared/components/ui/EmptyState";
import { SkeletonGroup } from "@/src/shared/components/ui/Skeleton";
import { Badge } from "@/src/shared/components/ui/Badge";
import { CustomerPartnerLink } from "../types/partners.types";
import { format } from "date-fns";
import { formsConfig } from "@/src/shared/constants/formsConfig";
import { extractArrayData } from "@/src/shared/utils/apiHelpers";

interface PartnerCustomersTabProps {
  partnerId: number;
}

export function PartnerCustomersTab({ partnerId }: PartnerCustomersTabProps) {
  const t = useTranslations();
  const listAlias = formsConfig["crm-customer-partner-links"].listAlias;

  const { query } = useApiForm({
    alias: listAlias!,
    defaultValues: { partner: partnerId },
  });

  const { data, isLoading, error } = query;
  const links = extractArrayData<CustomerPartnerLink>(data);

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
        title="خطأ في تحميل البيانات"
        description={(error as Error).message}
      />
    );
  }

  if (!links || links.length === 0) {
    return (
      <EmptyState
        type="search"
        title="لا يوجد عملاء"
        description="لم يتم ربط أي عملاء بهذا الشريك بعد"
        icon={<Users className="w-12 h-12 text-gray-400" />}
      />
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {links.map((link) => (
        <GlassCard
          key={link.id}
          className="relative group hover:shadow-md transition-all"
        >
          <div className="flex justify-between items-start mb-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg text-primary">
                <Users size={20} />
              </div>
              <div>
                <h4 className="font-bold text-main">{link.customer_name}</h4>
                <p className="text-xs text-secondary">{link.policy_number}</p>
              </div>
            </div>
            <Badge variant={link.is_active ? "success" : "neutral"}>
              {link.is_active ? "نشط" : "غير نشط"}
            </Badge>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-secondary">رقم العضوية</span>
              <span className="font-medium text-main">
                {link.member_id || "-"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-secondary">فئة التغطية</span>
              <span className="font-medium text-main">
                {link.coverage_class || "-"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-secondary">نهاية التغطية</span>
              <span
                className={`font-medium ${
                  link.is_coverage_active ? "text-green-500" : "text-red-500"
                }`}
              >
                {link.coverage_end
                  ? format(new Date(link.coverage_end), "yyyy-MM-dd")
                  : "-"}
              </span>
            </div>
            <div className="flex justify-between pt-2 border-t border-border-main/50">
              <span className="text-secondary">الحد المتبقي</span>
              <span className="font-bold text-primary">
                {Number(link.remaining_limit).toLocaleString()} ر.س
              </span>
            </div>
          </div>
        </GlassCard>
      ))}
    </div>
  );
}

// features/partners/components/PartnerCard.tsx
/**
 * بطاقة معلومات الشريك
 */

"use client";

import React from "react";
import {
  Building2,
  Phone,
  Mail,
  Calendar,
  Percent,
  CreditCard,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/shared/components/shadcn/ui/card";
import { Button } from "@/src/shared/components/shadcn/ui/button";
import type { Partner, PartnerType } from "../types/partners.types";

interface PartnerCardProps {
  partner: Partner;
  onViewStatement?: () => void;
  onEdit?: () => void;
}

const partnerTypeConfig: Record<PartnerType, { label: string; color: string }> =
{
  insurance: {
    label: "تأمين",
    color: "bg-blue-100 text-blue-700",
  },
  insurance_company: {
    label: "شركة تأمين",
    color: "bg-blue-100 text-blue-700",
  },
  bnpl: {
    label: "تجزئة الدفعات (BNPL)",
    color: "bg-teal-100 text-teal-700",
  },
  corporate: { label: "شركة", color: "bg-purple-100 text-purple-700" },
  wholesaler: {
    label: "تاجر جملة",
    color: "bg-amber-100 text-amber-700",
  },
  agent: {
    label: "وكيل",
    color: "bg-indigo-100 text-indigo-700",
  },
  government: { label: "جهة حكومية", color: "bg-green-100 text-green-700" },
  healthcare: { label: "مؤسسة صحية", color: "bg-red-100 text-red-700" },
  other: { label: "أخرى", color: "bg-gray-100 text-gray-700" },
};

export function PartnerCard({
  partner,
  onViewStatement,
  onEdit,
}: PartnerCardProps) {
  const config =
    partnerTypeConfig[partner.partner_type] || partnerTypeConfig.other;
  const creditLimit = parseFloat(partner.credit_limit || "0");
  const currentBalance = parseFloat(partner.current_balance || "0");
  const utilizationPercent =
    creditLimit > 0 ? (currentBalance / creditLimit) * 100 : 0;

  // Check contract validity
  const today = new Date();
  const contractEnd = partner.contract_end_date
    ? new Date(partner.contract_end_date)
    : null;
  const isContractExpired = contractEnd && contractEnd < today;
  const isContractExpiringSoon =
    contractEnd &&
    !isContractExpired &&
    contractEnd.getTime() - today.getTime() < 30 * 24 * 60 * 60 * 1000;

  return (
    <Card className="border-0 shadow-lg overflow-hidden">
      <CardHeader className="pb-3 bg-gradient-to-r from-primary/5 to-blue-500/5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-primary/10">
              <Building2 className="w-6 h-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">{partner.name}</CardTitle>
              {partner.name_en && (
                <p className="text-sm text-gray-500">{partner.name_en}</p>
              )}
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <span
              className={`px-2 py-1 rounded text-xs font-medium ${config.color}`}
            >
              {config.label}
            </span>
            {partner.is_active ? (
              <span className="flex items-center gap-1 text-xs text-green-600">
                <CheckCircle className="w-3 h-3" /> نشط
              </span>
            ) : (
              <span className="flex items-center gap-1 text-xs text-red-600">
                <XCircle className="w-3 h-3" /> غير نشط
              </span>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pt-4">
        {/* Contact Info */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          {partner.contact_person && (
            <div className="flex items-center gap-2 text-gray-600">
              <Building2 className="w-4 h-4" />
              {partner.contact_person}
            </div>
          )}
          {partner.phone && (
            <div className="flex items-center gap-2 text-gray-600">
              <Phone className="w-4 h-4" />
              {partner.phone}
            </div>
          )}
          {partner.email && (
            <div className="flex items-center gap-2 text-gray-600 col-span-2">
              <Mail className="w-4 h-4" />
              {partner.email}
            </div>
          )}
        </div>

        {/* Financial Info */}
        <div className="grid grid-cols-2 gap-4 py-3 border-y">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-primary mb-1">
              <Percent className="w-4 h-4" />
              <span className="text-sm">نسبة التغطية</span>
            </div>
            <div className="text-2xl font-bold">
              {parseFloat(partner.discount_percentage)}%
            </div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-gray-500 mb-1">
              <Clock className="w-4 h-4" />
              <span className="text-sm">شروط الدفع</span>
            </div>
            <div className="text-2xl font-bold">
              {partner.payment_terms_days} يوم
            </div>
          </div>
        </div>

        {/* Credit Info */}
        {creditLimit > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-1 text-gray-500">
                <CreditCard className="w-4 h-4" />
                حد الائتمان
              </span>
              <span className="font-medium">
                {creditLimit.toLocaleString()} ر.س
              </span>
            </div>
            <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${utilizationPercent > 90
                    ? "bg-red-500"
                    : utilizationPercent > 70
                      ? "bg-yellow-500"
                      : "bg-green-500"
                  }`}
                style={{ width: `${Math.min(utilizationPercent, 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>المستخدم: {currentBalance.toLocaleString()} ر.س</span>
              <span>{utilizationPercent.toFixed(1)}%</span>
            </div>
          </div>
        )}

        {/* Contract Dates */}
        {(partner.contract_start_date || partner.contract_end_date) && (
          <div
            className={`p-3 rounded-lg ${isContractExpired
                ? "bg-red-50 border border-red-200"
                : isContractExpiringSoon
                  ? "bg-yellow-50 border border-yellow-200"
                  : "bg-gray-50"
              }`}
          >
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4" />
              <span>فترة العقد:</span>
              <span className="font-medium">
                {partner.contract_start_date} - {partner.contract_end_date}
              </span>
            </div>
            {isContractExpired && (
              <p className="text-xs text-red-600 mt-1">⚠️ العقد منتهي</p>
            )}
            {isContractExpiringSoon && (
              <p className="text-xs text-yellow-600 mt-1">
                ⚠️ العقد ينتهي قريباً
              </p>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          {onViewStatement && (
            <Button
              variant="outline"
              size="sm"
              className="flex-1 gap-1"
              onClick={onViewStatement}
            >
              <FileText className="w-4 h-4" />
              كشف الحساب
            </Button>
          )}
          {onEdit && (
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={onEdit}
            >
              تعديل
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default PartnerCard;

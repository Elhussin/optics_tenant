// features/partners/components/PaymentSplitCalculator.tsx
/**
 * حاسبة تقسيم الدفع (حصة العميل/الشريك)
 */

"use client";

import React, { useState, useMemo } from "react";
import {
  Calculator,
  Users,
  Building2,
  DollarSign,
  ArrowLeftRight,
  Percent,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/src/shared/components/shadcn/ui/card";
import { Input } from "@/src/shared/components/shadcn/ui/input";
import { usePaymentSplit } from "../hooks/usePartners";
import type { CustomerPartnerLink } from "../types/partners.types";

interface PaymentSplitCalculatorProps {
  partnerLink?: CustomerPartnerLink;
  totalAmount?: number;
  onSplitChange?: (split: {
    partnerShare: number;
    customerShare: number;
  }) => void;
}

export function PaymentSplitCalculator({
  partnerLink,
  totalAmount: initialAmount = 0,
  onSplitChange,
}: PaymentSplitCalculatorProps) {
  const [amount, setAmount] = useState(initialAmount);
  const [customPatientShare, setCustomPatientShare] = useState<number | null>(
    null,
  );

  const { calculateSplit } = usePaymentSplit();

  // Calculate split
  const split = useMemo(() => {
    const sharePercentage =
      customPatientShare ??
      parseFloat(partnerLink?.patient_share_percentage || "0");
    const maxShare = partnerLink?.max_patient_share
      ? parseFloat(partnerLink.max_patient_share)
      : undefined;
    return calculateSplit(amount, sharePercentage, maxShare);
  }, [amount, customPatientShare, partnerLink, calculateSplit]);

  // Notify parent of changes
  React.useEffect(() => {
    if (onSplitChange) {
      onSplitChange({
        partnerShare: split.partner_share,
        customerShare: split.customer_share,
      });
    }
  }, [split, onSplitChange]);

  const patientSharePercentage =
    customPatientShare ??
    parseFloat(partnerLink?.patient_share_percentage || "0");

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Calculator className="w-5 h-5 text-primary" />
          حاسبة تقسيم الدفع
        </CardTitle>
        {partnerLink && (
          <CardDescription>
            {partnerLink.partner_name} - نسبة التحمل: {patientSharePercentage}%
          </CardDescription>
        )}
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Total Amount Input */}
        <div>
          <label className="text-sm font-medium text-gray-600 dark:text-gray-300 flex items-center gap-1 mb-2">
            <DollarSign className="w-4 h-4" />
            المبلغ الإجمالي
          </label>
          <Input
            type="number"
            value={amount || ""}
            onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
            className="text-lg font-semibold text-left"
            placeholder="0.00"
            min={0}
            step={0.01}
          />
        </div>

        {/* Share Override */}
        {!partnerLink && (
          <div>
            <label className="text-sm font-medium text-gray-600 dark:text-gray-300 flex items-center gap-1 mb-2">
              <Percent className="w-4 h-4" />
              نسبة التحمل
            </label>
            <Input
              type="number"
              value={customPatientShare ?? ""}
              onChange={(e) =>
                setCustomPatientShare(parseFloat(e.target.value) || 0)
              }
              className="text-left"
              placeholder="0"
              min={0}
              max={100}
            />
          </div>
        )}

        {/* Visual Split */}
        <div className="relative">
          <div className="flex overflow-hidden rounded-lg h-12">
            <div
              className="bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-center text-white font-medium transition-all"
              style={{ width: `${patientSharePercentage}%` }}
            >
              {patientSharePercentage > 15 && `${patientSharePercentage}%`}
            </div>
            <div
              className="bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center text-white font-medium transition-all"
              style={{ width: `${100 - patientSharePercentage}%` }}
            >
              {100 - patientSharePercentage > 15 &&
                `${100 - patientSharePercentage}%`}
            </div>
          </div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="bg-white dark:bg-gray-800 rounded-full p-2 shadow-lg">
              <ArrowLeftRight className="w-4 h-4 text-gray-500" />
            </div>
          </div>
        </div>

        {/* Split Details */}
        <div className="grid grid-cols-2 gap-4">
          {/* Customer Share */}
          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl text-center">
            <div className="flex items-center justify-center gap-2 text-green-600 mb-2">
              <Users className="w-5 h-5" />
              <span className="text-sm font-medium">حصة العميل</span>
            </div>
            <div className="text-2xl font-bold text-green-700">
              {split.customer_share.toLocaleString()}
            </div>
            <div className="text-xs text-green-500">ر.س</div>
          </div>

          {/* Partner Share */}
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-center">
            <div className="flex items-center justify-center gap-2 text-blue-600 mb-2">
              <Building2 className="w-5 h-5" />
              <span className="text-sm font-medium">حصة الشريك</span>
            </div>
            <div className="text-2xl font-bold text-blue-700">
              {split.partner_share.toLocaleString()}
            </div>
            <div className="text-xs text-blue-500">ر.س</div>
          </div>
        </div>

        {/* Max Cap Warning */}
        {partnerLink?.max_patient_share && (
          <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg text-sm text-yellow-700">
            <p>
              ⚠️ الحد الأقصى لتحمل العميل:{" "}
              {parseFloat(partnerLink.max_patient_share).toLocaleString()} ر.س
            </p>
          </div>
        )}

        {/* Summary */}
        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-500">المبلغ الإجمالي</span>
            <span className="font-bold">{amount.toLocaleString()} ر.س</span>
          </div>
          <div className="flex justify-between items-center text-sm mt-2">
            <span className="text-gray-500">نسبة التحمل المطبقة</span>
            <span className="font-medium">{patientSharePercentage}%</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default PaymentSplitCalculator;

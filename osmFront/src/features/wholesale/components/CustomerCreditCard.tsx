// features/wholesale/components/CustomerCreditCard.tsx
/**
 * بطاقة معلومات ائتمان العميل
 */

"use client";

import React from "react";
import {
  CreditCard,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/shared/components/shadcn/ui/card";
import type { WholesaleCustomer, CreditStatus } from "../types/wholesale.types";

interface CustomerCreditCardProps {
  customer: WholesaleCustomer;
  onEditCredit?: () => void;
}

const statusConfig: Record<
  CreditStatus,
  { icon: React.ReactNode; color: string; label: string }
> = {
  none: {
    icon: <XCircle className="w-4 h-4" />,
    color: "text-gray-500 bg-gray-100",
    label: "لا يوجد",
  },
  pending: {
    icon: <Clock className="w-4 h-4" />,
    color: "text-yellow-600 bg-yellow-100",
    label: "قيد المراجعة",
  },
  approved: {
    icon: <CheckCircle className="w-4 h-4" />,
    color: "text-green-600 bg-green-100",
    label: "معتمد",
  },
  suspended: {
    icon: <AlertCircle className="w-4 h-4" />,
    color: "text-red-600 bg-red-100",
    label: "موقوف",
  },
};

const tierLabels: Record<string, string> = {
  retail: "تجزئة",
  wholesale_1: "جملة - المستوى 1",
  wholesale_2: "جملة - المستوى 2",
  wholesale_3: "جملة - VIP",
  distributor: "موزع",
  special: "سعر خاص",
};

export function CustomerCreditCard({
  customer,
  onEditCredit,
}: CustomerCreditCardProps) {
  const creditLimit = parseFloat(customer.credit_limit || "0");
  const currentBalance = parseFloat(customer.current_balance || "0");
  const availableCredit = creditLimit - currentBalance;
  const utilizationPercent =
    creditLimit > 0 ? (currentBalance / creditLimit) * 100 : 0;

  const status = statusConfig[customer.credit_status] || statusConfig.none;
  const isOverLimit = currentBalance > creditLimit && creditLimit > 0;

  return (
    <Card className="border-0 shadow-lg bg-gradient-to-br from-primary/5 to-blue-500/5">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <CreditCard className="w-5 h-5 text-primary" />
            </div>
            معلومات الائتمان
          </CardTitle>
          {onEditCredit && (
            <button
              onClick={onEditCredit}
              className="text-sm text-primary hover:underline"
            >
              تعديل
            </button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Credit Status Badge */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">حالة الائتمان</span>
          <div
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${status.color}`}
          >
            {status.icon}
            {status.label}
          </div>
        </div>

        {/* Pricing Tier */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">مستوى التسعير</span>
          <span className="text-sm font-semibold text-primary">
            {tierLabels[customer.pricing_tier] || customer.pricing_tier}
          </span>
        </div>

        {/* Credit Limit */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">حد الائتمان</span>
          <span className="text-lg font-bold">
            {creditLimit.toLocaleString()} ر.س
          </span>
        </div>

        {/* Credit Usage Bar */}
        {creditLimit > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">المستخدم</span>
              <span
                className={`font-medium ${isOverLimit ? "text-red-600" : ""}`}
              >
                {utilizationPercent.toFixed(1)}%
              </span>
            </div>
            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  utilizationPercent > 90
                    ? "bg-red-500"
                    : utilizationPercent > 70
                    ? "bg-yellow-500"
                    : "bg-green-500"
                }`}
                style={{ width: `${Math.min(utilizationPercent, 100)}%` }}
              />
            </div>
          </div>
        )}

        {/* Balance Details */}
        <div className="grid grid-cols-2 gap-4 pt-3 border-t">
          <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <TrendingUp className="w-5 h-5 text-red-500 mx-auto mb-1" />
            <div className="text-xs text-gray-500 mb-1">الرصيد المستحق</div>
            <div
              className={`text-lg font-bold ${
                isOverLimit ? "text-red-600" : "text-gray-900 dark:text-white"
              }`}
            >
              {currentBalance.toLocaleString()} ر.س
            </div>
          </div>
          <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <TrendingDown className="w-5 h-5 text-green-500 mx-auto mb-1" />
            <div className="text-xs text-gray-500 mb-1">المتاح</div>
            <div
              className={`text-lg font-bold ${
                availableCredit < 0 ? "text-red-600" : "text-green-600"
              }`}
            >
              {availableCredit.toLocaleString()} ر.س
            </div>
          </div>
        </div>

        {/* Payment Terms */}
        {customer.payment_terms_days > 0 && (
          <div className="flex items-center justify-between pt-3 border-t text-sm">
            <span className="text-gray-500">شروط الدفع</span>
            <span className="font-medium">
              {customer.payment_terms_days} يوم
            </span>
          </div>
        )}

        {/* Minimum Order */}
        {parseFloat(customer.minimum_order_amount) > 0 && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">الحد الأدنى للطلب</span>
            <span className="font-medium">
              {parseFloat(customer.minimum_order_amount).toLocaleString()} ر.س
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default CustomerCreditCard;

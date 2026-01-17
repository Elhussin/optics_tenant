// features/payment/components/InstallmentCard.tsx
/**
 * بطاقة القسط
 */

"use client";

import React from "react";
import {
  Calendar,
  CheckCircle,
  Clock,
  AlertTriangle,
  DollarSign,
  XCircle,
} from "lucide-react";
import { Button } from "@/src/shared/components/shadcn/ui/button";
import type { Installment, InstallmentStatus } from "../types/payment.types";

interface InstallmentCardProps {
  installment: Installment;
  onMarkPaid?: (id: number) => void;
  loading?: boolean;
}

const statusConfig: Record<
  InstallmentStatus,
  {
    icon: React.ReactNode;
    color: string;
    bgColor: string;
    label: string;
  }
> = {
  upcoming: {
    icon: <Clock className="w-4 h-4" />,
    color: "text-gray-600",
    bgColor: "bg-gray-100 dark:bg-gray-800",
    label: "قادم",
  },
  due: {
    icon: <Calendar className="w-4 h-4" />,
    color: "text-blue-600",
    bgColor: "bg-blue-50 dark:bg-blue-900/20",
    label: "مستحق",
  },
  paid: {
    icon: <CheckCircle className="w-4 h-4" />,
    color: "text-green-600",
    bgColor: "bg-green-50 dark:bg-green-900/20",
    label: "مدفوع",
  },
  overdue: {
    icon: <AlertTriangle className="w-4 h-4" />,
    color: "text-red-600",
    bgColor: "bg-red-50 dark:bg-red-900/20",
    label: "متأخر",
  },
  cancelled: {
    icon: <XCircle className="w-4 h-4" />,
    color: "text-gray-500",
    bgColor: "bg-gray-100 dark:bg-gray-800",
    label: "ملغي",
  },
};

export function InstallmentCard({
  installment,
  onMarkPaid,
  loading = false,
}: InstallmentCardProps) {
  const config = statusConfig[installment.status];
  const amount = parseFloat(installment.amount);

  // Calculate days until/since due
  const today = new Date();
  const dueDate = new Date(installment.due_date);
  const diffDays = Math.ceil(
    (dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <div className={`p-4 rounded-xl ${config.bgColor} transition-all`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div
            className={`p-2 rounded-lg bg-white dark:bg-gray-900 shadow-sm ${config.color}`}
          >
            {config.icon}
          </div>
          <div>
            <span className="text-sm font-medium">
              القسط #{installment.installment_number}
            </span>
            <div className={`text-xs ${config.color}`}>{config.label}</div>
          </div>
        </div>
        <div className="text-left">
          <div className="flex items-center gap-1 text-lg font-bold">
            <DollarSign className="w-4 h-4 text-gray-400" />
            {amount.toLocaleString()}
          </div>
          <div className="text-xs text-gray-500">ر.س</div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm">
          <span className="text-gray-500">تاريخ الاستحقاق:</span>
          <span className="font-medium mr-1">{installment.due_date}</span>
          {installment.status !== "paid" &&
            installment.status !== "cancelled" && (
              <span
                className={`text-xs mr-2 ${
                  diffDays < 0
                    ? "text-red-500"
                    : diffDays <= 3
                    ? "text-yellow-500"
                    : "text-gray-400"
                }`}
              >
                (
                {diffDays > 0
                  ? `بعد ${diffDays} يوم`
                  : `متأخر ${Math.abs(diffDays)} يوم`}
                )
              </span>
            )}
        </div>

        {installment.status === "paid" && installment.paid_date && (
          <div className="text-sm text-green-600">
            <span className="text-gray-500">تم الدفع:</span>
            <span className="font-medium mr-1">{installment.paid_date}</span>
          </div>
        )}

        {(installment.status === "due" || installment.status === "overdue") &&
          onMarkPaid && (
            <Button
              size="sm"
              onClick={() => onMarkPaid(installment.id)}
              disabled={loading}
              className="gap-1"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              تسجيل دفع
            </Button>
          )}
      </div>
    </div>
  );
}

// Installments List Component
export function InstallmentsList({
  installments,
  onMarkPaid,
  loading = false,
}: {
  installments: Installment[];
  onMarkPaid?: (id: number) => void;
  loading?: boolean;
}) {
  if (installments.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        <Calendar className="w-12 h-12 mx-auto mb-2 opacity-30" />
        <p>لا توجد أقساط</p>
      </div>
    );
  }

  // Calculate progress
  const paidCount = installments.filter((i) => i.status === "paid").length;
  const totalCount = installments.length;
  const progressPercent = (paidCount / totalCount) * 100;

  return (
    <div className="space-y-4">
      {/* Progress Bar */}
      <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">التقدم</span>
          <span className="text-sm text-gray-500">
            {paidCount} من {totalCount}
          </span>
        </div>
        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Installments */}
      <div className="space-y-3">
        {installments.map((installment) => (
          <InstallmentCard
            key={installment.id}
            installment={installment}
            onMarkPaid={onMarkPaid}
            loading={loading}
          />
        ))}
      </div>
    </div>
  );
}

export default InstallmentCard;

// features/partners/components/ClaimStatusBadge.tsx
/**
 * شارة حالة المطالبة
 */

"use client";

import React from "react";
import {
  Clock,
  Send,
  CheckCircle,
  XCircle,
  DollarSign,
  AlertCircle,
  FileText,
  Eye,
  Ban,
  AlertTriangle,
} from "lucide-react";
import type { ClaimStatus } from "../types/partners.types";

interface ClaimStatusBadgeProps {
  status: ClaimStatus;
  size?: "sm" | "md" | "lg";
}

const statusConfig: Record<
  ClaimStatus,
  {
    icon: React.ReactNode;
    color: string;
    bgColor: string;
    label: string;
  }
> = {
  draft: {
    icon: <FileText className="w-3.5 h-3.5" />,
    color: "text-slate-700",
    bgColor: "bg-slate-100 dark:bg-slate-900/30",
    label: "مسودة",
  },
  pending: {
    icon: <Clock className="w-3.5 h-3.5" />,
    color: "text-yellow-700",
    bgColor: "bg-yellow-100 dark:bg-yellow-900/30",
    label: "قيد الانتظار",
  },
  submitted: {
    icon: <Send className="w-3.5 h-3.5" />,
    color: "text-blue-700",
    bgColor: "bg-blue-100 dark:bg-blue-900/30",
    label: "تم الإرسال",
  },
  under_review: {
    icon: <Eye className="w-3.5 h-3.5" />,
    color: "text-indigo-700",
    bgColor: "bg-indigo-100 dark:bg-indigo-900/30",
    label: "تحت المراجعة",
  },
  approved: {
    icon: <CheckCircle className="w-3.5 h-3.5" />,
    color: "text-green-700",
    bgColor: "bg-green-100 dark:bg-green-900/30",
    label: "موافق عليها",
  },
  partial: {
    icon: <AlertTriangle className="w-3.5 h-3.5" />,
    color: "text-amber-700",
    bgColor: "bg-amber-100 dark:bg-amber-900/30",
    label: "موافقة جزئية",
  },
  rejected: {
    icon: <XCircle className="w-3.5 h-3.5" />,
    color: "text-red-700",
    bgColor: "bg-red-100 dark:bg-red-900/30",
    label: "مرفوضة",
  },
  paid: {
    icon: <DollarSign className="w-3.5 h-3.5" />,
    color: "text-emerald-700",
    bgColor: "bg-emerald-100 dark:bg-emerald-900/30",
    label: "مدفوعة",
  },
  partially_paid: {
    icon: <AlertCircle className="w-3.5 h-3.5" />,
    color: "text-orange-700",
    bgColor: "bg-orange-100 dark:bg-orange-900/30",
    label: "مدفوعة جزئياً",
  },
  cancelled: {
    icon: <Ban className="w-3.5 h-3.5" />,
    color: "text-gray-700",
    bgColor: "bg-gray-100 dark:bg-gray-900/30",
    label: "ملغاة",
  },
};

const sizeClasses = {
  sm: "text-xs px-2 py-0.5",
  md: "text-sm px-2.5 py-1",
  lg: "text-base px-3 py-1.5",
};

export function ClaimStatusBadge({
  status,
  size = "md",
}: ClaimStatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.pending;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-medium ${config.bgColor} ${config.color} ${sizeClasses[size]}`}
    >
      {config.icon}
      {config.label}
    </span>
  );
}

export default ClaimStatusBadge;

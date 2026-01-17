// shared/components/ui/EmptyState.tsx
/**
 * Empty State Component
 * مكون الحالة الفارغة
 */

"use client";

import React from "react";
import { cn } from "@/src/shared/utils/cn";
import {
  Inbox,
  Search,
  FileX,
  Users,
  ShoppingCart,
  Package,
  FolderOpen,
  AlertCircle,
} from "lucide-react";

type EmptyStateType =
  | "default"
  | "search"
  | "data"
  | "users"
  | "orders"
  | "products"
  | "files"
  | "error";

interface EmptyStateProps {
  type?: EmptyStateType;
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

const defaultConfig: Record<
  EmptyStateType,
  { icon: React.ReactNode; title: string; description: string }
> = {
  default: {
    icon: <Inbox className="w-full h-full" />,
    title: "لا توجد بيانات",
    description: "لم يتم العثور على أي عناصر",
  },
  search: {
    icon: <Search className="w-full h-full" />,
    title: "لا توجد نتائج",
    description: "جرب استخدام كلمات بحث مختلفة",
  },
  data: {
    icon: <FileX className="w-full h-full" />,
    title: "لا توجد بيانات",
    description: "لم يتم إضافة أي بيانات بعد",
  },
  users: {
    icon: <Users className="w-full h-full" />,
    title: "لا يوجد مستخدمون",
    description: "لم يتم إضافة أي مستخدمين بعد",
  },
  orders: {
    icon: <ShoppingCart className="w-full h-full" />,
    title: "لا توجد طلبات",
    description: "لم يتم إنشاء أي طلبات بعد",
  },
  products: {
    icon: <Package className="w-full h-full" />,
    title: "لا توجد منتجات",
    description: "لم يتم إضافة أي منتجات بعد",
  },
  files: {
    icon: <FolderOpen className="w-full h-full" />,
    title: "لا توجد ملفات",
    description: "لم يتم رفع أي ملفات بعد",
  },
  error: {
    icon: <AlertCircle className="w-full h-full" />,
    title: "حدث خطأ",
    description: "لم نتمكن من تحميل البيانات",
  },
};

export function EmptyState({
  type = "default",
  title,
  description,
  icon,
  action,
  className,
}: EmptyStateProps) {
  const config = defaultConfig[type];

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-12 px-4 text-center",
        className
      )}
    >
      <div className="w-16 h-16 mb-4 text-secondary opacity-30">
        {icon || config.icon}
      </div>
      <h3 className="text-lg font-semibold text-main mb-2">
        {title || config.title}
      </h3>
      <p className="text-sm text-secondary max-w-sm mb-4">
        {description || config.description}
      </p>
      {action}
    </div>
  );
}

// Compact Empty State (for inline use)
interface CompactEmptyStateProps {
  message?: string;
  icon?: React.ReactNode;
  className?: string;
}

export function CompactEmptyState({
  message = "لا توجد بيانات",
  icon,
  className,
}: CompactEmptyStateProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-center gap-2 py-8 text-secondary",
        className
      )}
    >
      <span className="w-5 h-5 opacity-50">
        {icon || <Inbox className="w-full h-full" />}
      </span>
      <span className="text-sm">{message}</span>
    </div>
  );
}

export default EmptyState;

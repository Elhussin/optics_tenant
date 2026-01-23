import React from "react";
import {
  Package,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Calendar,
} from "lucide-react";
import { GlassCard } from "@/src/shared/components/ui/GlassCard";
import { Badge } from "@/src/shared/components/ui/Badge";

interface Stock {
  id: number;
  branch: number;
  branch_name?: string;
  branch_code?: string;
  variant: number;
  variant_name?: string;
  variant_sku?: string;
  product_name?: string;
  quantity_in_stock: number;
  reserved_quantity: number;
  available_quantity: number;
  reorder_level: number;
  average_cost: number;
  stock_status: string;
  last_restocked?: string | null;
  last_sale?: string | null;
  is_active: boolean;
}

interface StockInfoProps {
  stock: Stock;
}

export function StockInfo({ stock }: StockInfoProps) {
  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { variant: any; label: string }> = {
      "In Stock": { variant: "success", label: "متوفر" },
      "Low Stock": { variant: "warning", label: "منخفض" },
      "Out of Stock": { variant: "danger", label: "نفذ" },
      Overstocked: { variant: "info", label: "زائد" },
    };

    const config = statusMap[status] || { variant: "neutral", label: status };
    return (
      <Badge variant={config.variant} outline dot>
        {config.label}
      </Badge>
    );
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "-";
    return new Intl.DateTimeFormat("ar-SA", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(dateString));
  };

  const formatMoney = (amount: number) => {
    return amount.toLocaleString("ar-SA", { maximumFractionDigits: 2 });
  };

  return (
    <div className="space-y-6">
      {/* Product Info */}
      <GlassCard className="border-border-main/50" hover>
        <div className="p-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                <Package size={32} className="text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-main mb-1">
                  {stock.product_name}
                </h2>
                <p className="text-secondary text-sm">
                  SKU: <span className="font-mono">{stock.variant_sku}</span>
                </p>
                <p className="text-secondary text-sm">{stock.variant_name}</p>
              </div>
            </div>
            {getStatusBadge(stock.stock_status)}
          </div>

          {/* Branch Info */}
          <div className="p-4 rounded-xl bg-surface border border-border-main">
            <p className="text-sm text-secondary mb-1">الفرع</p>
            <p className="font-semibold text-main">
              {stock.branch_name}
              {stock.branch_code && (
                <span className="text-secondary text-sm mr-2">
                  ({stock.branch_code})
                </span>
              )}
            </p>
          </div>
        </div>
      </GlassCard>

      {/* Stock Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Available */}
        <GlassCard className="border-border-main/50" hover>
          <div className="p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <p className="text-sm text-secondary">المتاح</p>
            </div>
            <p className="text-4xl font-bold text-green-600 dark:text-green-400">
              {stock.available_quantity}
            </p>
          </div>
        </GlassCard>

        {/* Reserved */}
        <GlassCard className="border-border-main/50" hover>
          <div className="p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-amber-600 dark:text-amber-400" />
              </div>
              <p className="text-sm text-secondary">المحجوز</p>
            </div>
            <p className="text-4xl font-bold text-amber-600 dark:text-amber-400">
              {stock.reserved_quantity}
            </p>
          </div>
        </GlassCard>

        {/* Total */}
        <GlassCard className="border-border-main/50" hover>
          <div className="p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <Package className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <p className="text-sm text-secondary">الإجمالي</p>
            </div>
            <p className="text-4xl font-bold text-blue-600 dark:text-blue-400">
              {stock.quantity_in_stock}
            </p>
          </div>
        </GlassCard>
      </div>

      {/* Additional Info */}
      <GlassCard className="border-border-main/50" hover>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-main mb-4">
            معلومات إضافية
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-surface border border-border-main">
              <p className="text-sm text-secondary mb-1">التكلفة المتوسطة</p>
              <p className="text-xl font-bold text-main">
                {formatMoney(stock.average_cost)} ر.س
              </p>
            </div>

            <div className="p-4 rounded-xl bg-surface border border-border-main">
              <p className="text-sm text-secondary mb-1">مستوى إعادة الطلب</p>
              <p className="text-xl font-bold text-main">
                {stock.reorder_level}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-surface border border-border-main">
              <div className="flex items-center gap-2 mb-1">
                <Calendar size={14} className="text-secondary" />
                <p className="text-sm text-secondary">آخر عملية شراء</p>
              </div>
              <p className="text-sm font-medium text-main">
                {formatDate(stock.last_restocked)}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-surface border border-border-main">
              <div className="flex items-center gap-2 mb-1">
                <Calendar size={14} className="text-secondary" />
                <p className="text-sm text-secondary">آخر عملية بيع</p>
              </div>
              <p className="text-sm font-medium text-main">
                {formatDate(stock.last_sale)}
              </p>
            </div>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}

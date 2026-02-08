"use client";

import React, { useMemo, useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  ArrowRightLeft,
  AlertTriangle,
  Package,
  RotateCcw,
  Lock,
  Unlock,
  Calendar,
  User,
  Eye,
  Edit2,
  Search,
} from "lucide-react";
import { GlassCard } from "@/src/shared/components/ui/GlassCard";
import { Badge } from "@/src/shared/components/ui/Badge";
import { EmptyState } from "@/src/shared/components/ui/EmptyState";
import { SectionLoading } from "@/src/shared/components/ui/Spinner";
import { useApiForm } from "@/src/shared/hooks/useApiForm";
import type {
  StockMovement,
  MovementType,
} from "@/src/features/stock-management/types";
import { useTranslations } from "next-intl";
import { Button } from "@/src/shared/components/shadcn/ui/button";
import { Input } from "@/src/shared/components/shadcn/ui/input";
import Link from "next/link";

interface MovementsListProps {
  maxItems?: number;
  showFilters?: boolean;
}

export function MovementsList({
  maxItems,
  showFilters = true,
}: MovementsListProps) {
  const t = useTranslations("inventory");
  const [filterType, setFilterType] = useState<MovementType | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const { query } = useApiForm({
    alias: "products_stock_movements_list",
    defaultValues: {
      page_size: 100,
      ordering: "-created_at",
    },
  });

  const movements = useMemo(() => {
    const data: any = query.data;
    if (!data) return [];
    if (Array.isArray(data)) return data;
    return Array.isArray(data.results) ? data.results : [];
  }, [query.data]);

  const filteredMovements = useMemo(() => {
    let result = movements;

    // Filter by type
    if (filterType !== "all") {
      result = result.filter(
        (m: StockMovement) => m.movement_type === filterType,
      );
    }

    // Filter by search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (m: StockMovement) =>
          m.stock_info?.product_name?.toLowerCase().includes(q) ||
          m.stock_info?.variant_name?.toLowerCase().includes(q) ||
          m.stock_info?.branch_name?.toLowerCase().includes(q) ||
          m.reference_number?.toLowerCase().includes(q) ||
          m.notes?.toLowerCase().includes(q),
      );
    }

    // Limit items
    if (maxItems) {
      return result.slice(0, maxItems);
    }

    return result;
  }, [movements, filterType, searchQuery, maxItems]);

  const getMovementIcon = (type: MovementType) => {
    const iconMap: Record<MovementType, React.ReactNode> = {
      purchase: <TrendingUp size={18} className="text-green-600" />,
      sale: <TrendingDown size={18} className="text-red-600" />,
      transfer_in: <ArrowRightLeft size={18} className="text-blue-600" />,
      transfer_out: <ArrowRightLeft size={18} className="text-orange-600" />,
      adjustment: <Package size={18} className="text-purple-600" />,
      damage: <AlertTriangle size={18} className="text-red-600" />,
      return: <RotateCcw size={18} className="text-green-600" />,
      return_to_supplier: <TrendingDown size={18} className="text-red-500" />,
      reserve: <Lock size={18} className="text-amber-600" />,
      release: <Unlock size={18} className="text-green-600" />,
    };
    return iconMap[type] || <Package size={18} />;
  };

  const getMovementBadge = (type: MovementType, display: string) => {
    const badgeMap: Record<MovementType, { variant: any; label: string }> = {
      purchase: { variant: "success", label: t("movements.types.purchase") },
      sale: { variant: "danger", label: t("movements.types.sale") },
      transfer_in: { variant: "info", label: t("movements.types.transfer_in") },
      transfer_out: {
        variant: "warning",
        label: t("movements.types.transfer_out"),
      },
      adjustment: {
        variant: "neutral",
        label: t("movements.types.adjustment"),
      },
      damage: { variant: "danger", label: t("movements.types.damage") },
      return: { variant: "success", label: t("movements.types.return") },
      return_to_supplier: {
        variant: "danger",
        label: t("movements.types.return_to_supplier"),
      },
      reserve: { variant: "warning", label: t("movements.types.reserve") },
      release: { variant: "success", label: t("movements.types.release") },
    };

    const config = badgeMap[type] || { variant: "neutral", label: display };
    return (
      <Badge variant={config.variant} outline>
        <span className="flex items-center gap-1">
          {getMovementIcon(type)}
          {config.label}
        </span>
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat("ar-SA", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(dateString));
  };

  const formatQuantity = (quantity: number) => {
    if (quantity > 0) {
      return <span className="text-green-600 font-semibold">+{quantity}</span>;
    } else if (quantity < 0) {
      return <span className="text-red-600 font-semibold">{quantity}</span>;
    }
    return <span className="text-secondary">0</span>;
  };

  if (query.isLoading) {
    return (
      <GlassCard className="border-border-main/50" hover>
        <div className="p-6 flex items-center justify-center min-h-[300px]">
          <SectionLoading />
        </div>
      </GlassCard>
    );
  }

  return (
    <div className="space-y-6">
      {showFilters && (
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary w-4 h-4 rtl:left-auto rtl:right-3" />
            <Input
              placeholder={t("stocks.searchPlaceholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 rtl:pl-4 rtl:pr-10"
            />
          </div>

          <select
            value={filterType}
            onChange={(e) =>
              setFilterType(e.target.value as MovementType | "all")
            }
            className="w-full md:w-auto px-4 py-2 rounded-xl bg-surface border border-border-main text-sm focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
          >
            <option value="all">{t("movements.all")}</option>
            <option value="purchase">{t("movements.types.purchase")}</option>
            <option value="sale">{t("movements.types.sale")}</option>
            <option value="transfer_in">
              {t("movements.types.transfer_in")}
            </option>
            <option value="transfer_out">
              {t("movements.types.transfer_out")}
            </option>
            <option value="adjustment">
              {t("movements.types.adjustment")}
            </option>
            <option value="damage">{t("movements.types.damage")}</option>
            <option value="return">{t("movements.types.return")}</option>
            <option value="return_to_supplier">
              {t("movements.types.return_to_supplier")}
            </option>
            <option value="reserve">{t("movements.types.reserve")}</option>
            <option value="release">{t("movements.types.release")}</option>
          </select>
        </div>
      )}

      {filteredMovements.length === 0 ? (
        <EmptyState
          title={t("movements.emptyTitle")}
          description={t("movements.emptyDescription")}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredMovements.map((movement: StockMovement, index: number) => (
            <GlassCard
              key={movement.id}
              className="p-4 border-border-main hover:border-primary/50 transition-all duration-300 animate-fade-in-up"
              // style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* Info */}
                <div className="flex-1 space-y-2">
                  <div className="flex items-center flex-wrap gap-2">
                    {getMovementBadge(
                      movement.movement_type,
                      movement.movement_type_display,
                    )}
                    <span className="text-sm font-medium text-main">
                      {movement.stock_info?.product_name}
                    </span>
                    <span className="text-xs text-secondary bg-secondary/10 px-2 py-0.5 rounded-full">
                      {movement.stock_info?.branch_name}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-secondary">
                    <div className="flex items-center gap-1">
                      <Calendar size={12} />
                      {formatDate(movement.created_at)}
                    </div>
                    {movement.created_by_name && (
                      <div className="flex items-center gap-1">
                        <User size={12} />
                        {movement.created_by_name}
                      </div>
                    )}
                    {movement.reference_number && (
                      <button
                        onClick={() =>
                          setSearchQuery(movement.reference_number)
                        }
                        className="font-mono bg-surface border px-1 rounded hover:bg-primary/10 hover:text-primary transition-colors"
                        title={t("movements.filterByRef")}
                      >
                        {movement.reference_number}
                      </button>
                    )}
                  </div>
                </div>

                {/* Values */}
                <div className="flex flex-row md:flex-col items-center md:items-end justify-between gap-4">
                  <div className="text-2xl font-bold">
                    {formatQuantity(movement.quantity)}
                  </div>

                  <div className="flex gap-2">
                    <Link
                      href={`/dashboard/stock-management/movements/${movement.id}`}
                      className="p-2 text-secondary hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                      title={t("movements.view")}
                    >
                      <Eye size={18} />
                    </Link>
                    <Link
                      href={`/dashboard/stock-management/movements/${movement.id}/edit`}
                      className="p-2 text-secondary hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                      title={t("movements.edit")}
                    >
                      <Edit2 size={18} />
                    </Link>
                  </div>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
}

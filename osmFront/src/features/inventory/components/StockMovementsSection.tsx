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
} from "lucide-react";
import { GlassCard } from "@/src/shared/components/ui/GlassCard";
import { Badge } from "@/src/shared/components/ui/Badge";
import { EmptyState } from "@/src/shared/components/ui/EmptyState";
import { Loading4 } from "@/src/shared/components/ui/loding";
import { useApiForm } from "@/src/shared/hooks/useApiForm";
import type { StockMovement, MovementType } from "../types";

interface StockMovementsSectionProps {
  stockId: number;
}

export function StockMovementsSection({ stockId }: StockMovementsSectionProps) {
  const [filterType, setFilterType] = useState<MovementType | "all">("all");

  const { query } = useApiForm({
    alias: "products_stock_movements_list",
    defaultValues: {
      stock: stockId,
      page_size: 100,
      ordering: "-created_at",
    },
    enabled: !!stockId,
  });

  const movements = useMemo(() => {
    const data: any = query.data;
    if (!data) return [];
    if (Array.isArray(data)) return data;
    return Array.isArray(data.results) ? data.results : [];
  }, [query.data]);

  const filteredMovements = useMemo(() => {
    if (filterType === "all") return movements;
    return movements.filter(
      (m: StockMovement) => m.movement_type === filterType,
    );
  }, [movements, filterType]);

  const getMovementIcon = (type: MovementType) => {
    const iconMap: Record<MovementType, React.ReactNode> = {
      purchase: <TrendingUp size={18} className="text-green-600" />,
      sale: <TrendingDown size={18} className="text-red-600" />,
      transfer_in: <ArrowRightLeft size={18} className="text-blue-600" />,
      transfer_out: <ArrowRightLeft size={18} className="text-orange-600" />,
      adjustment: <Package size={18} className="text-purple-600" />,
      damage: <AlertTriangle size={18} className="text-red-600" />,
      return: <RotateCcw size={18} className="text-green-600" />,
      reserve: <Lock size={18} className="text-amber-600" />,
      release: <Unlock size={18} className="text-green-600" />,
    };
    return iconMap[type] || <Package size={18} />;
  };

  const getMovementBadge = (type: MovementType, display: string) => {
    const badgeMap: Record<MovementType, { variant: any; label: string }> = {
      purchase: { variant: "success", label: display || "شراء" },
      sale: { variant: "danger", label: display || "بيع" },
      transfer_in: { variant: "info", label: display || "تحويل وارد" },
      transfer_out: { variant: "warning", label: display || "تحويل صادر" },
      adjustment: { variant: "neutral", label: display || "تعديل" },
      damage: { variant: "danger", label: display || "تلف" },
      return: { variant: "success", label: display || "إرجاع" },
      reserve: { variant: "warning", label: display || "حجز" },
      release: { variant: "success", label: display || "تحرير" },
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
          <Loading4 />
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="border-border-main/50" hover>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-main flex items-center gap-2">
            <Package size={20} className="text-primary" />
            حركات المخزون ({filteredMovements.length})
          </h3>

          {/* Filter */}
          <select
            value={filterType}
            onChange={(e) =>
              setFilterType(e.target.value as MovementType | "all")
            }
            className="px-4 py-2 rounded-xl bg-surface border border-border-main text-sm focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
          >
            <option value="all">جميع الحركات</option>
            <option value="purchase">شراء</option>
            <option value="sale">بيع</option>
            <option value="transfer_in">تحويل وارد</option>
            <option value="transfer_out">تحويل صادر</option>
            <option value="adjustment">تعديل</option>
            <option value="damage">تلف</option>
            <option value="return">إرجاع</option>
            <option value="reserve">حجز</option>
            <option value="release">تحرير</option>
          </select>
        </div>

        {filteredMovements.length === 0 ? (
          <EmptyState
            title="لا توجد حركات"
            description="لم يتم تسجيل أي حركات لهذا المخزون بعد"
          />
        ) : (
          <div className="space-y-3">
            {filteredMovements.map((movement: StockMovement, index: number) => (
              <div
                key={movement.id}
                className="p-4 rounded-xl bg-surface border border-border-main hover:border-primary/50 transition-all duration-300 animate-fade-in-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {getMovementBadge(
                      movement.movement_type,
                      movement.movement_type_display,
                    )}
                    <div className="flex items-center gap-2 text-sm text-secondary">
                      <Calendar size={14} />
                      {formatDate(movement.created_at)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">
                      {formatQuantity(movement.quantity)}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-secondary mb-1">قبل</p>
                    <p className="font-semibold text-main">
                      {movement.quantity_before}
                    </p>
                  </div>
                  <div>
                    <p className="text-secondary mb-1">بعد</p>
                    <p className="font-semibold text-main">
                      {movement.quantity_after}
                    </p>
                  </div>
                  {movement.cost_per_unit &&
                    parseFloat(movement.cost_per_unit) > 0 && (
                      <div>
                        <p className="text-secondary mb-1">التكلفة</p>
                        <p className="font-semibold text-main">
                          {parseFloat(movement.cost_per_unit).toLocaleString(
                            "ar-SA",
                            {
                              maximumFractionDigits: 2,
                            },
                          )}{" "}
                          ر.س
                        </p>
                      </div>
                    )}
                </div>

                {(movement.created_by_name ||
                  movement.reference_number ||
                  movement.notes) && (
                  <div className="mt-3 pt-3 border-t border-border-main/50 space-y-2">
                    {movement.created_by_name && (
                      <div className="flex items-center gap-2 text-sm text-secondary">
                        <User size={14} />
                        <span>{movement.created_by_name}</span>
                      </div>
                    )}
                    {movement.reference_number && (
                      <p className="text-sm text-secondary">
                        المرجع:{" "}
                        <span className="font-mono">
                          {movement.reference_number}
                        </span>
                      </p>
                    )}
                    {movement.notes && (
                      <p className="text-sm text-secondary italic">
                        {movement.notes}
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </GlassCard>
  );
}

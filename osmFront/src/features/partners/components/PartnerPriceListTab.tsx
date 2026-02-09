// features/partners/components/PartnerPriceListTab.tsx
"use client";

import React from "react";
import { Tag } from "lucide-react";
import { GlassCard } from "@/src/shared/components/ui/GlassCard";
import { EmptyState } from "@/src/shared/components/ui/EmptyState";
import { SkeletonGroup } from "@/src/shared/components/ui/Skeleton";
import { Badge } from "@/src/shared/components/ui/Badge";
import { FlexiblePrice } from "../types/partners.types";

import { useApiForm } from "@/src/shared/hooks/useApiForm";
import { formsConfig } from "@/src/shared/constants/formsConfig";
import { extractArrayData } from "@/src/shared/utils/apiHelpers";

interface PartnerPriceListTabProps {
  partnerId: number;
}

export function PartnerPriceListTab({ partnerId }: PartnerPriceListTabProps) {
  const listAlias = formsConfig["products-flexible-prices"].listAlias;

  const { query } = useApiForm({
    alias: listAlias!,
    defaultValues: { partner: partnerId },
  });

  const { data, isLoading, error } = query;
  const prices = extractArrayData<FlexiblePrice>(data);

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
        title="خطأ"
        description={(error as Error).message}
      />
    );
  }

  if (!prices || prices.length === 0) {
    return (
      <EmptyState
        type="search"
        title="لا توجد أسعار خاصة"
        description="لم يتم تحديد أسعار خاصة لهذا الشريك"
        icon={<Tag className="w-12 h-12 text-gray-400" />}
      />
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {prices.map((price) => (
        <GlassCard
          key={price.id}
          className="flex justify-between items-center group hover:border-primary/50 transition-colors"
        >
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 bg-orange-100 text-orange-600 rounded-lg">
                <Tag size={18} />
              </div>
              <div>
                <h4 className="font-bold text-main">
                  {price.variant_name || `Variant ${price.variant}`}
                </h4>
                <div className="flex gap-2 text-xs text-secondary">
                  {price.min_quantity > 1 && (
                    <span>أقل كمية: {price.min_quantity}</span>
                  )}
                  {price.end_date && <span>ينتهي: {price.end_date}</span>}
                </div>
              </div>
            </div>
          </div>

          <div className="text-left">
            {price.discount_percentage ? (
              <Badge variant="info" className="text-lg px-3 py-1">
                خصم {Number(price.discount_percentage)}%
              </Badge>
            ) : (
              <div>
                <div className="text-xs text-secondary">سعر خاص</div>
                <div className="text-lg font-bold text-primary">
                  {Number(price.special_price).toLocaleString()} ر.س
                </div>
              </div>
            )}
          </div>
        </GlassCard>
      ))}
    </div>
  );
}

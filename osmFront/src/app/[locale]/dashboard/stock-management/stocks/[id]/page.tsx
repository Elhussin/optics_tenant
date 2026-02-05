"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowRight, Plus, Edit, BarChart3 } from "lucide-react";
import Link from "next/link";
import { ActionButton } from "@/src/shared/components/ui/buttons";
import { SectionLoading } from "@/src/shared/components/ui/Spinner";
import { useApiForm } from "@/src/shared/hooks/useApiForm";
import { StockInfo } from "@/src/features/stock-management/components/StockInfo";
import { StockMovementsSection } from "@/src/features/stock-management/components/StockMovementsSection";
import { useTranslations } from "next-intl";
import { featuresConfig } from "@/src/shared/constants/entityConfig";
export default function StockDetailsPage() {
  const t = useTranslations("inventory");
  const params = useParams();
  const router = useRouter();
  const stockId = params.id ? parseInt(params.id as string, 10) : null;

  const { query, isBusy } = useApiForm({
    alias: featuresConfig.stocks.retrieveAlias,
    defaultValues: { id: stockId },
    enabled: !!stockId,
  });

  const stock = query.data;
console.log(stock);

  if (isBusy || !stock) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <SectionLoading />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-body py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link
              href="/dashboard/stock-management"
              className="text-sm text-secondary hover:text-primary flex items-center gap-1 mb-2 transition-colors"
            >
              <ArrowRight size={16} />
              {t("details.backToInventory")}
            </Link>
            <h1 className="text-3xl font-bold text-main">
              {t("details.title")}
            </h1>
          </div>

          <div className="flex gap-3">
            <ActionButton
              variant="outline"
              icon={<BarChart3 size={18} />}
              label={t("details.reports")}
              onClick={() => {
                // TODO: Navigate to reports
              }}
            />
            <ActionButton
              variant="secondary"
              icon={<Edit size={18} />}
              label={t("details.editStock")}
              navigateTo={`/dashboard/stock-management/add?stock=${stockId}`}
            />
            <ActionButton
              variant="primary"
              icon={<Plus size={18} />}
              label={t("details.addMovement")}
              navigateTo={`/dashboard/stock-management/add?stock=${stockId}`}
              className="shadow-lg shadow-primary/20"
            />
          </div>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {/* Stock Info */}
          <StockInfo stock={stock} />

          {/* Stock Movements */}
          <StockMovementsSection stockId={stockId!} />
        </div>
      </div>
    </div>
  );
}

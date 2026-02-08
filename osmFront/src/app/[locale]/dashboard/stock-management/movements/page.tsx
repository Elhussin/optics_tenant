"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { MovementsList } from "@/src/features/stock-management/components/movements/MovementsList";
import { ArrowRight, Plus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/src/shared/components/shadcn/ui/button";

export default function StockMovementsPage() {
  const t = useTranslations("inventory");

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
              {t("movements.all")}
            </h1>
            <p className="text-secondary mt-1">
              {t("movements.subtitle") ||
                "Track all inventory changes across all branches"}
            </p>
          </div>

          <Link href="/dashboard/stock-management/movements/create">
            <Button className="gap-2">
              <Plus size={18} />
              {t("addMovement")}
            </Button>
          </Link>
        </div>

        {/* Content */}
        <MovementsList />
      </div>
    </div>
  );
}

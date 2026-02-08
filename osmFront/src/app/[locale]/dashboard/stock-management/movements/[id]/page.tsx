"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useApiForm } from "@/src/shared/hooks/useApiForm";
import { SectionLoading } from "@/src/shared/components/ui/Spinner";
import {
  ArrowRight,
  Calendar,
  Package,
  FileText,
  User,
  TrendingUp,
  TrendingDown,
  ArrowRightLeft,
  AlertTriangle,
  RotateCcw,
  Lock,
  Unlock,
  Edit,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/src/shared/components/shadcn/ui/button";
import { Badge } from "@/src/shared/components/ui/Badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/shared/components/shadcn/ui/card";
import Separator from "@/src/shared/components/ui/Separator";

export default function StockMovementViewPage() {
  const t = useTranslations("inventory");
  const params = useParams();
  const router = useRouter();
  const id = params.id ? parseInt(params.id as string, 10) : null;

  const { query } = useApiForm({
    alias: "products_stock_movements_retrieve",
    defaultValues: { id },
    enabled: !!id,
  });

  const movement = query.data;

  if (query.isLoading || !movement) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <SectionLoading />
      </div>
    );
  }

  const getMovementIcon = (type: string) => {
    switch (type) {
      case "purchase":
        return <TrendingUp className="text-green-600" />;
      case "sale":
        return <TrendingDown className="text-red-600" />;
      case "transfer_in":
        return <ArrowRightLeft className="text-blue-600" />;
      case "transfer_out":
        return <ArrowRightLeft className="text-orange-600" />;
      case "adjustment":
        return <Package className="text-purple-600" />;
      case "damage":
        return <AlertTriangle className="text-red-600" />;
      case "return":
        return <RotateCcw className="text-green-600" />;
      case "return_to_supplier":
        return <TrendingDown className="text-red-500" />;
      case "reserve":
        return <Lock className="text-amber-600" />;
      case "release":
        return <Unlock className="text-green-600" />;
      default:
        return <Package />;
    }
  };

  return (
    <div className="min-h-screen bg-body py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <button
              onClick={() => router.back()}
              className="text-sm text-secondary hover:text-primary flex items-center gap-1 mb-2 transition-colors"
            >
              <ArrowRight size={16} />
              {t("common.back")}
            </button>
            <h1 className="text-3xl font-bold text-main flex items-center gap-3">
              {getMovementIcon(movement.movement_type)}
              {t("movements.detailsTitle")} #{movement.id}
            </h1>
          </div>

          <Link
            href={`/dashboard/stock-management/movements/${movement.id}/edit`}
          >
            <Button variant="outline" className="gap-2">
              <Edit size={16} />
              {t("common.edit")}
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main Info */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                {t("movements.info")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-secondary mb-1">
                    {t("movements.type")}
                  </p>
                  <Badge variant="neutral" className="text-base py-1 px-3">
                    {movement.movement_type_display}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-secondary mb-1">
                    {t("movements.quantity")}
                  </p>
                  <p
                    className={`text-2xl font-bold ${
                      movement.quantity > 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {movement.quantity > 0 ? "+" : ""}
                    {movement.quantity}
                  </p>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-secondary mb-1">
                    {t("movements.before")}
                  </p>
                  <p className="font-semibold text-main">
                    {movement.quantity_before}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-secondary mb-1">
                    {t("movements.after")}
                  </p>
                  <p className="font-semibold text-main">
                    {movement.quantity_after}
                  </p>
                </div>
              </div>

              {parseFloat(movement.cost_per_unit || "0") > 0 && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm text-secondary mb-1">
                      {t("movements.cost")}
                    </p>
                    <p className="font-semibold text-main">
                      {parseFloat(movement.cost_per_unit).toLocaleString(
                        "ar-SA",
                        {
                          style: "currency",
                          currency: "SAR",
                        },
                      )}
                    </p>
                  </div>
                </>
              )}

              {movement.notes && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm text-secondary mb-1">
                      {t("movements.notes")}
                    </p>
                    <p className="text-main whitespace-pre-wrap">
                      {movement.notes}
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Related Info */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  {t("movements.productInfo")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-secondary mb-1">
                    {t("movements.product")}
                  </p>
                  <Link
                    href={`/dashboard/stock-management/stocks/${movement.stock}`}
                    className="font-medium text-primary hover:underline"
                  >
                    {movement.stock_info?.product_name || "-"}
                  </Link>
                </div>
                <div>
                  <p className="text-sm text-secondary mb-1">
                    {t("movements.variant")}
                  </p>
                  <p className="font-medium text-main">
                    {movement.stock_info?.variant_name || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-secondary mb-1">
                    {t("movements.branch")}
                  </p>
                  <p className="font-medium text-main">
                    {movement.stock_info?.branch_name || "-"}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  {t("movements.auditInfo")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-secondary mb-1">
                    {t("common.createdAt")}
                  </p>
                  <div className="flex items-center gap-2 text-main">
                    <Calendar size={16} className="text-secondary" />
                    <span>
                      {new Date(movement.created_at).toLocaleString("ar-SA")}
                    </span>
                  </div>
                </div>

                {movement.created_by_name && (
                  <div>
                    <p className="text-sm text-secondary mb-1">
                      {t("common.createdBy")}
                    </p>
                    <div className="flex items-center gap-2 text-main">
                      <User size={16} className="text-secondary" />
                      <span>{movement.created_by_name}</span>
                    </div>
                  </div>
                )}

                {movement.reference_number && (
                  <div>
                    <p className="text-sm text-secondary mb-1">
                      {t("movements.reference")}
                    </p>
                    <p className="font-mono bg-secondary/10 px-2 py-1 rounded inline-block text-sm">
                      {movement.reference_number}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

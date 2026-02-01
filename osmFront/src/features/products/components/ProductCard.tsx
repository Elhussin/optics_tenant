"use client";

import React from "react";
import { Loading4 } from "@/src/shared/components/ui/loding";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/shared/components/ui/card";
import { ActionButton } from "@/src/shared/components/ui/buttons";
import { Pencil, Eye, Plus, Package } from "lucide-react";
import { useTranslations } from "next-intl";



const TYPE_COLORS: Record<string, string> = {
  frames: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  sunglasses:
    "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  readingGlasses:
    "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  contactLenses:
    "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  treatmentLenses:
    "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400",
  accessories: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400",
  lenses: "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400",
};


// Product Card Component
export function ProductCard({ product }: { product: any }) {
  console.log(product);
  const t = useTranslations("products");
  const typeColor = TYPE_COLORS[product.type] || TYPE_COLORS.OT;

  return (
    <Card className="group hover:shadow-lg transition-all duration-200 border border-gray-200 dark:border-gray-700">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base font-semibold line-clamp-2">
            {product.name || `${product.brand_name} ${product.model}`}
          </CardTitle>
          <span
            className={`px-2 py-1 text-xs font-medium rounded-full shrink-0 ${typeColor}`}
          >
            { product.main_group}
            {/* /t(`main_group.${product.main_group}`) ||  */}
          </span>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Brand & Model */}
        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-secondary">{t("fields.brand")}:</span>
            <span className="font-medium">{product.brand_name || "-"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-secondary">{t("fields.model")}:</span>
            <span className="font-medium">{product.model || "-"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-secondary">{t("fields.variantType")}:</span>
            <span className="font-medium">
              {t(`variantTypes.${product.variant_type}`) ||
                product.variant_type ||
                "-"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-secondary">{t("fields.variantCount")}:</span>
            <span className="font-medium">{product.variants?.length || 0}</span>
          </div>
        </div>

        {/* SKU */}
        <div className="pt-2 border-t border-gray-100 dark:border-gray-700">
          <p className="text-xs text-secondary truncate" title={product.sku}>
            SKU: {product.sku || "-"}
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <ActionButton
            label={t("actions.edit")}
            icon={<Pencil size={14} />}
            variant="outline"
            navigateTo={`/dashboard/products/${product.id}/edit`}
            className="flex-1 text-sm"
          />
          <ActionButton
            label={t("actions.view")}
            icon={<Eye size={14} />}
            variant="ghost"
            navigateTo={`/dashboard/products/${product.id}`}
            className="flex-1 text-sm"
          />
        </div>
      </CardContent>
    </Card>
  );
}
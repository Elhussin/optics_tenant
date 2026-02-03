/**
 * ✨ ProductView - محسّن مع Premium UI Design
 * @description عرض تفاصيل المنتج مع GlassCard، Animations، و Premium Effects
 */

"use client";

import React, { useEffect } from "react";
// Loading4 removed
import { NotFound } from "@/src/shared/components/views/NotFound";
import { useApiForm } from "@/src/shared/hooks/useApiForm";
import { ActionButton } from "@/src/shared/components/ui/buttons";
import {
  Pencil,
  Package,
  Tag,
  Barcode,
  Layers,
  Plus,
  Sparkles,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { GlassCard } from "@/src/shared/components/ui/GlassCard";
import { Badge } from "@/src/shared/components/ui/Badge";
import { cn } from "@/src/shared/utils/cn";
import { useTranslations } from "next-intl";
import { InfoItem } from "../../../../../shared/components/ui/InfoItem";
import { VariantCard } from "../../variant/VariantCard";
import { Skeleton } from "@/src/shared/components/ui/Skeleton";
import { featuresConfig } from "@/src/shared/constants/entityConfig";
// Product type badges (Premium variants)
const TYPE_VARIANTS: Record<
  string,
  "primary" | "success" | "warning" | "danger"
> = {
  FR: "primary",
  CL: "success",
  SL: "warning",
  AX: "danger",
  DV: "primary",
  OT: "primary", // Changed from "neutral" to "primary"
};
import { ProductViewProps } from "../../../types";

export function ProductView({ productId }: ProductViewProps) {
  const t = useTranslations("products");
  const numericId = parseInt(productId, 10);

  const { query, isBusy } = useApiForm({
    alias: featuresConfig["product"].retrieveAlias,
    defaultValues: { id: numericId },
    enabled: !isNaN(numericId),
  });

  const { data: product, isLoading, isError } = query;

  useEffect(() => {
    if (!isNaN(numericId)) {
      query.refetch();
    }
  }, [numericId]);

  if (isLoading || isBusy) {
    return <Skeleton />;
  }

  if (isError || !product) {
    return <NotFound error={t("view.productNotFound")} />;
  }

  const typeVariant = TYPE_VARIANTS[product.type] || "primary";

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* ✨ Enhanced Header with Glassmorphism */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative"
      >
        {/* Gradient Background Glow */}
        <div className="absolute -inset-2 bg-gradient-to-r from-primary/20 via-secondary/20 to-primary/20 blur-2xl opacity-30 -z-10" />

        <GlassCard className="border-none overflow-visible" padding="md">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            {/* Product Info */}
            <div className="flex items-start gap-4 flex-1">
              <div
                className={cn(
                  "w-16 h-16 rounded-xl shrink-0",
                  "bg-gradient-to-br from-primary to-blue-600",
                  "flex items-center justify-center",
                  "shadow-lg shadow-primary/30",
                )}
              >
                <Package className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-2">
                  <h1 className="text-2xl font-bold text-foreground">
                    {product.name || `${product.brand_name} ${product.model}`}
                  </h1>
                  <Badge variant={typeVariant}>
                    {
                      // product.type_display ||
                      //   t(`main_group.${product.main_group}`) ||
                      product.main_group
                    }
                  </Badge>
                </div>
                {product.description && (
                  <p className="text-sm text-secondary line-clamp-2">
                    {product.description}
                  </p>
                )}
              </div>
            </div>

            {/* Actions */}
            <ActionButton
              label={t("actions.editProduct")}
              icon={<Pencil size={16} />}
              variant="outline"
              navigateTo={`/dashboard/products/${productId}/edit`}
              className="hover:scale-105 transition-transform"
            />
          </div>

          {/* Product Details Grid */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6"
          >
            <InfoItem
              icon={<Tag size={18} />}
              label={t("fields.brand")}
              value={product.brand_name || "-"}
            />
            <InfoItem
              icon={<Layers size={18} />}
              label={t("fields.model")}
              value={product.model || "-"}
            />
            <InfoItem
              icon={<Barcode size={18} />}
              label={t("fields.sku")}
              value={product.sku || "-"}
            />
            <InfoItem
              icon={<Sparkles size={18} />}
              label={t("fields.variantType")}
              value={
                t(`variantTypes.${product.variant_type}`) ||
                product.variant_type ||
                "-"
              }
            />
          </motion.div>
        </GlassCard>
      </motion.div>

      {/* Categories Section */}
      {product.categories?.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <GlassCard padding="md">
            <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <Tag className="w-5 h-5 text-primary" />
              {t("fields.categories")}
            </h2>
            <div className="flex flex-wrap gap-2">
              {product.categories.map((cat: any, index: number) => (
                <motion.div
                  key={cat.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 * index, duration: 0.3 }}
                >
                  <Badge variant="primary" className="text-sm">
                    {cat.name}
                  </Badge>
                </motion.div>
              ))}
            </div>
          </GlassCard>
        </motion.div>
      )}

      {/* Variants Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        <GlassCard padding="md">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Layers className="w-5 h-5 text-primary" />
              {t("variants.title")} ({product.variants?.length || 0})
            </h2>
            <ActionButton
              label={t("variants.add")}
              icon={<Plus size={16} />}
              variant="outline"
              navigateTo={`/dashboard/products/${productId}/variants/add`}
              className="hover:scale-105 transition-transform"
            />
          </div>

          {product.variants?.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                <Layers className="w-8 h-8 text-primary opacity-50" />
              </div>
              <p className="text-secondary">{t("variants.noVariants")}</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <AnimatePresence>
                {product.variants?.map((variant: any, index: number) => (
                  <VariantCard
                    key={variant.id || index}
                    variant={variant}
                    index={index}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}
        </GlassCard>
      </motion.div>
    </div>
  );
}

export default ProductView;

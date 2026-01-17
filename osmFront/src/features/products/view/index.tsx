/**
 * ✨ ProductView - محسّن مع Premium UI Design
 * @description عرض تفاصيل المنتج مع GlassCard، Animations، و Premium Effects
 */

"use client";

import React, { useEffect } from "react";
import { Loading4 } from "@/src/shared/components/ui/loding";
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

interface ProductViewProps {
  productId: string;
}

export function ProductView({ productId }: ProductViewProps) {
  const numericId = parseInt(productId, 10);

  const { query, isBusy } = useApiForm({
    alias: "products_products_retrieve",
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
    return <Loading4 />;
  }

  if (isError || !product) {
    return (
      <NotFound error="لم يتم العثور على المنتج - تأكد من صحة رابط المنتج" />
    );
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
                    {product.type_display || product.type}
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
              label="تعديل المنتج"
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
              label="العلامة التجارية"
              value={product.brand_name || "-"}
            />
            <InfoItem
              icon={<Layers size={18} />}
              label="الموديل"
              value={product.model || "-"}
            />
            <InfoItem
              icon={<Barcode size={18} />}
              label="SKU"
              value={product.usku || "-"}
            />
            <InfoItem
              icon={<Sparkles size={18} />}
              label="نوع المتغير"
              value={product.variant_type || "-"}
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
              التصنيفات
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
              المتغيرات ({product.variants?.length || 0})
            </h2>
            <ActionButton
              label="إضافة متغير"
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
              <p className="text-secondary">لا توجد متغيرات لهذا المنتج</p>
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

// ✨ Info Item Component - Premium Design
function InfoItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-elevated/50 hover:bg-elevated transition-all duration-300 border-2 border-primary/20 hover:border-primary/40 group">
      <div className="text-primary group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <div className="flex-1">
        <p className="text-xs text-secondary mb-0.5">{label}</p>
        <p className="font-semibold text-foreground">{value}</p>
      </div>
    </div>
  );
}

// ✨ Variant Card Component - Premium Design
function VariantCard({ variant, index }: { variant: any; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ delay: index * 0.1, duration: 0.3 }}
      className="relative group"
    >
      {/* Hover Glow */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="relative p-5 border-2 border-primary/30 rounded-xl bg-elevated/50 hover:bg-elevated transition-all duration-300 hover:scale-[1.02]">
        <div className="flex items-center justify-between mb-4">
          <Badge variant="primary" className="text-xs">
            المتغير #{index + 1}
          </Badge>
          <span className="text-xs text-secondary font-mono">
            {variant.usku || "-"}
          </span>
        </div>

        <div className="space-y-3 text-sm">
          <div className="flex justify-between items-center">
            <span className="text-secondary">سعر البيع:</span>
            <span className="font-bold text-primary text-base">
              {variant.selling_price ? `${variant.selling_price} ر.س` : "-"}
            </span>
          </div>

          {variant.discount_percentage > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-secondary">الخصم:</span>
              <Badge variant="success" className="text-xs">
                {variant.discount_percentage}%
              </Badge>
            </div>
          )}

          {variant.last_purchase_price && (
            <div className="flex justify-between items-center">
              <span className="text-secondary">سعر الشراء:</span>
              <span className="font-medium">
                {variant.last_purchase_price} ر.س
              </span>
            </div>
          )}

          {variant.description && (
            <div className="pt-3 border-t border-primary/20">
              <p className="text-xs text-secondary mb-1">الوصف:</p>
              <p className="text-sm text-foreground line-clamp-2">
                {variant.description}
              </p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default ProductView;

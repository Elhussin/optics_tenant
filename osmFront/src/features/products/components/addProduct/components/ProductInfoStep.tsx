/**
 * ✨ ProductInfoStep - محسّن مع Premium UI Design
 * @description Step 2: Product information مع GlassCard وGlow Effects
 */

"use client";

import React, { useMemo, useCallback } from "react";
import { RenderFields } from "@/src/shared/components/field/RenderFields";
import { ProductConfig } from "@/src/features/products/constants/config";
import { motion } from "framer-motion";
import { cn } from "@/src/shared/utils/cn";
import { Info } from "lucide-react";
import { GlassCard } from "@/src/shared/components/ui/GlassCard";
import { useProductFormStore } from "@/src/features/products/store/useProductFormStore";

interface ProductInfoStepProps {
  form: any;
  productType: string;
}

import { useTranslations } from "next-intl";

export function ProductInfoStep({ form, productType }: ProductInfoStepProps) {
  const t = useTranslations("products");
  const { setShowModal, setEntityName, setCurrentFieldName } =
    useProductFormStore();

  // Filter config based on product type
  const filteredConfig = useMemo(() => {
    return ProductConfig.filter(
      (item) => item.role === "all" || item.role === productType,
    ).map((item) => ({
      ...item,
      label: t(`fields.${item.name}`) || item.label,
      placeholder: t(`fields.${item.name}`) || item.placeholder,
    }));
  }, [productType, t]);

  // Handle adding new entity
  const handleAddNew = useCallback(
    (entityName: string, fieldName: string) => {
      setEntityName(entityName);
      setCurrentFieldName(fieldName);
      setShowModal(true);
    },
    [setEntityName, setCurrentFieldName, setShowModal],
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      {/* ✨ Enhanced Header with GlassCard */}
      <div className="relative">
        {/* Subtle gradient glow */}
        <div className="absolute -inset-1 bg-gradient-to-r from-primary/10 to-blue-500/10 rounded-2xl blur-lg opacity-50 -z-10" />

        <GlassCard padding="sm" className="border-none mt-2">
          <div className="flex items-start gap-4">
            <div
              className={cn(
                "w-12 h-12 rounded-xl",
                "bg-gradient-to-br from-primary to-blue-600",
                "flex items-center justify-center shrink-0",
                "shadow-lg shadow-primary/30",
              )}
            >
              <Info className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-black text-foreground mb-1">
                {t("steps.infoTitle")}
              </h3>
              <p className="text-sm text-secondary">
                {t("steps.infoDescription")}
              </p>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* ✨ Fields with Animation */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.4 }}
      >
        <RenderFields
          fields={filteredConfig}
          form={form}
          selectedType={productType}
          onAddNew={handleAddNew}
        />
      </motion.div>
    </motion.div>
  );
}

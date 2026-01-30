/**
 * ✨ ProductVariantStep - محسّن مع Premium UI Design
 * @description Step 3: Product variants مع GlassCard، enhanced accordion، و validation
 */

"use client";

import React, { useMemo, useCallback } from "react";
import { useFieldArray } from "react-hook-form";
import {
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  Tags,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/src/shared/components/shadcn/ui/button";
import { RenderFields } from "@/src/shared/components/field/RenderFields";
import {
  veriantConfig,
  BasicVariantConfig,
  CustomVariantMainConfig,
} from "@/src/features/products/constants/config";
import { cn } from "@/src/shared/utils/cn";
import { useProductFormStore } from "@/src/features/products/store/useProductFormStore";
import { AttributesSection } from "./AttributesSection";
import { motion, AnimatePresence } from "framer-motion";
import { GlassCard } from "@/src/shared/components/ui/GlassCard";

interface ProductVariantStepProps {
  form: any;
  productType: string;
  variantType: string;
}

import { useTranslations } from "next-intl";

export function ProductVariantStep({
  form,
  productType,
  variantType,
}: ProductVariantStepProps) {
  const t = useTranslations("products");
  const store = useProductFormStore();
  const { setShowModal, setEntityName, setCurrentFieldName } = store;

  // Handle adding new entity
  const handleAddNew = useCallback(
    (entityName: string, fieldName: string) => {
      setEntityName(entityName);
      setCurrentFieldName(fieldName);
      setShowModal(true);
    },
    [setEntityName, setCurrentFieldName, setShowModal],
  );

  // Field array for variants
  const {
    fields: variants,
    append: addVariant,
    remove: removeVariant,
  } = useFieldArray({
    control: form.control,
    name: "variants",
  });

  // Get variant config based on type
  const variantFields = useMemo(() => {
    let fields;
    if (variantType === "custom") {
      fields = CustomVariantMainConfig;
    } else {
      fields = veriantConfig(variantType);
    }

    return fields.map((item) => ({
      ...item,
      label: t(`fields.${item.name}`) || item.label,
      placeholder: t(`fields.${item.name}`) || item.placeholder,
    }));
  }, [variantType, t]);

  // Ensure at least one variant exists and auto-open it
  React.useEffect(() => {
    if (variants.length === 0) {
      addVariant({
        sku: "",
        selling_price: "",
        discount_percentage: 0,
        attributes: [],
      });
      // Auto-open the first variant
      store.setOpenVariantIndex(0);
    }
  }, [variants.length, addVariant, store]);

  const handleAddVariant = () => {
    addVariant({ sku: "", selling_price: "", attributes: [] });
  };

  const handleRemoveVariant = (index: number) => {
    if (variants.length > 1) {
      removeVariant(index);
    }
  };

  const toggleVariant = (index: number) => {
    store.setOpenVariantIndex(store.openVariantIndex === index ? null : index);
  };

  // Get form errors for variants
  const variantsError = form.formState.errors?.variants;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      {/* ✨ Enhanced Header with GlassCard */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1">
          {/* Subtle gradient glow */}
          <div className="absolute -inset-1 bg-gradient-to-r from-primary/10 to-blue-500/10 rounded-2xl blur-lg opacity-50 -z-10" />

          <GlassCard padding="sm" className="border-primary/50 mt-2">
            <div className="flex items-start gap-4">
              <div
                className={cn(
                  "w-12 h-12 rounded-xl",
                  "bg-gradient-to-br from-primary to-blue-600",
                  "flex items-center justify-center shrink-0",
                  "shadow-lg shadow-primary/30",
                )}
              >
                <Tags className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-black text-foreground mb-1 ">
                  {variantType === "basic"
                    ? t("sections.pricingAndDetails")
                    : t("variants.title")}
                </h3>
                <p className="text-sm text-secondary">
                  {variantType === "basic"
                    ? t("steps.enterPricingDetails")
                    : t("steps.addVariantsDescription")}
                </p>
              </div>
            </div>
          </GlassCard>
        </div>

        {variantType !== "basic" && (
          <Button
            type="button"
            variant="outline"
            onClick={handleAddVariant}
            className={cn(
              "gap-2 border-2 border-dashed border-primary/50",
              "text-primary hover:bg-primary/10",
              "hover:scale-105 transition-all",
            )}
          >
            <Plus className="w-4 h-4" />
            {t("variants.add")}
          </Button>
        )}
      </div>

      {/* ✨ Variants Error Message */}
      <AnimatePresence>
        {variantsError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={cn(
              "px-4 py-3 rounded-xl",
              "bg-destructive/10 border-2 border-destructive/20",
              "flex items-center gap-3",
            )}
          >
            <AlertCircle className="w-5 h-5 text-destructive shrink-0" />
            <p className="text-sm font-semibold text-destructive">
              {t("validation.invalidVariantsData")}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ✨ Enhanced Variants List */}
      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {variants.map((variant, index) => {
            const isOpen = store.openVariantIndex === index;

            return (
              <motion.div
                key={variant.id || index}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                layout
                className={cn(
                  "border-2 rounded-2xl overflow-hidden",
                  "transition-all duration-200",
                  isOpen
                    ? "border-primary shadow-xl shadow-primary/10"
                    : "border-primary/50 shadow-md",
                )}
              >
                {/* ✨ Variant Header */}
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => toggleVariant(index)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      toggleVariant(index);
                    }
                  }}
                  className={cn(
                    "w-full p-4 flex items-center justify-between cursor-pointer",
                    "transition-colors",
                    isOpen
                      ? "bg-primary/10"
                      : "bg-elevated/50 hover:bg-elevated",
                  )}
                >
                  <div className="flex items-center gap-3">
                    <motion.span
                      animate={{
                        scale: isOpen ? 1.1 : 1,
                      }}
                      className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center",
                        "text-sm font-black",
                        isOpen
                          ? "bg-gradient-to-br from-primary to-blue-600 text-white shadow-lg"
                          : "bg-background border-2 border-primary/50 text-muted-foreground",
                      )}
                    >
                      {index + 1}
                    </motion.span>
                    <span className="font-bold text-foreground text-base">
                      {t("variants.variantLabel", { number: index + 1 })}
                    </span>

                    {/* Show basic info preview when closed */}
                    {!isOpen && form.watch(`variants.${index}.sku`) && (
                      <span className="text-sm text-muted-foreground ms-2 hidden sm:inline">
                        SKU: {form.watch(`variants.${index}.sku`)}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {variants.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveVariant(index);
                        }}
                        className={cn(
                          "text-destructive hover:text-destructive",
                          "hover:bg-destructive/10",
                          "transition-all hover:scale-110",
                        )}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                    <motion.div
                      animate={{ rotate: isOpen ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronDown className="w-5 h-5 text-muted-foreground" />
                    </motion.div>
                  </div>
                </div>

                {/* ✨ Variant Content */}
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div
                        className={cn(
                          "p-6 border-t-2 border-primary/50",
                          "bg-background space-y-6",
                        )}
                      >
                        <RenderFields
                          form={form}
                          fields={variantFields}
                          variantNumber={index}
                          selectedType={productType}
                          onAddNew={handleAddNew}
                        />

                        {/* Custom Attributes Section */}
                        {variantType === "custom" && (
                          <AttributesSection variantIndex={index} form={form} />
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* ✨ Enhanced Add Variant Button */}
      {variantType !== "basic" && variants.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Button
            type="button"
            variant="outline"
            onClick={handleAddVariant}
            className={cn(
              "w-full border-dashed border-2 py-6",
              "border-primary text-primary",
              "hover:bg-primary/5 hover:border-primary",
              "transition-all hover:scale-102",
            )}
          >
            <Plus className="w-5 h-5 me-2" />
            <span className="font-bold">{t("variants.addNew")}</span>
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
}

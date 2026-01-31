/**
 * ✨ ProductTypeStep - محسّن مع Error Messages و Animations
 * @description Step 1: Product type and variant selection مع enhanced validation
 */

"use client";

import React, { useMemo } from "react";
import {
  Package,
  Glasses,
  Eye,
  Activity,
  Settings,
  MoreHorizontal,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/src/shared/utils/cn";
import {
  PRODUCT_TYPE_CHOICES,
  VARIANT_TYPE_CHOICES,
} from "@/src/features/products/constants/config";
import { motion, AnimatePresence } from "framer-motion";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/src/shared/components/shadcn/ui/form";
import { useTranslations } from "next-intl";

interface ProductTypeStepProps {
  form: any;
  productType: string;
}

// Map product types to icons
const PRODUCT_ICONS: Record<string, React.ElementType> = {
  CL: Eye,
  SL: Glasses,
  FR: Glasses,
  AX: Settings,
  DV: Activity,
  OT: MoreHorizontal,
};

// Map product types to gradient colors
const PRODUCT_COLORS: Record<string, string> = {
  CL: "from-cyan-500 to-blue-600",
  SL: "from-violet-500 to-purple-600",
  FR: "from-amber-500 to-orange-600",
  AX: "from-emerald-500 to-green-600",
  DV: "from-pink-500 to-rose-600",
  OT: "from-gray-500 to-slate-600",
};

export function ProductTypeStep({ form, productType }: ProductTypeStepProps) {
  const t = useTranslations("products");
  const handleTypeSelect = (value: string) => {
    form.setValue("main_group", value, { shouldValidate: true });
    // Reset variant_type when product type changes
    form.setValue("variant_type", "", { shouldValidate: false });
  };

  // Filter variant types based on selected product type
  const filteredVariantTypes = useMemo(() => {
    if (!productType) return [];
    return VARIANT_TYPE_CHOICES.filter(
      (v) => v.role === "all" || v.role === productType,
    );
  }, [productType]);

  // Get form errors
  const typeError = form.formState.errors?.main_group;
  const variantError = form.formState.errors?.variant_type;

  return (
    <div className="space-y-8">
      {/* ✨ Product Type Selection */}
      <FormField
        control={form.control}
        name="main_group"
        render={({ field, fieldState }) => (
          <FormItem>
            <FormLabel className="text-xl font-black text-foreground mb-4 block ">
              {t("steps.type")} *
            </FormLabel>
            <FormControl>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {PRODUCT_TYPE_CHOICES.map((type, index) => {
                  const Icon = PRODUCT_ICONS[type.value] || Package;
                  const isSelected = productType === type.value;
                  const gradientColor =
                    PRODUCT_COLORS[type.value] || "from-gray-500 to-slate-600";

                  return (
                    <motion.button
                      key={type.value}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                      type="button"
                      onClick={() => handleTypeSelect(type.value)}
                      className={cn(
                        "relative p-6 rounded-2xl border-1",
                        "transition-all duration-300 group cursor-pointer",
                        isSelected
                          ? "border-primary bg-primary/10 shadow-xl shadow-primary/20 scale-105"
                          : "border-primary/50 bg-elevated hover:border-primary/50 hover:shadow-lg hover:scale-102",
                      )}
                    >
                      {/* ✨ Selection indicator */}
                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 500 }}
                          className="absolute top-3 start-3 w-7 h-7 rounded-full bg-primary flex items-center justify-center shadow-lg"
                        >
                          <CheckCircle2 className="w-5 h-5 text-white" />
                        </motion.div>
                      )}

                      {/* ✨ Icon */}
                      <div
                        className={cn(
                          "w-16 h-16 rounded-2xl mb-4 flex items-center justify-center mx-auto",
                          "transition-transform group-hover:scale-110",
                          isSelected
                            ? `bg-gradient-to-br ${gradientColor} text-white shadow-lg`
                            : "bg-background text-muted-foreground",
                        )}
                      >
                        <Icon className="w-8 h-8" />
                      </div>

                      {/* ✨ Label */}
                      <p
                        className={cn(
                          "font-bold text-center transition-colors text-base",
                          isSelected ? "text-primary" : "text-foreground",
                        )}
                      >
                        {/* Translate Type Label */}
                        {t(`types.${type.value}`)}
                      </p>
                    </motion.button>
                  );
                })}
              </div>
            </FormControl>

            {/* ✨ Enhanced Error Message */}
            <AnimatePresence>
              {fieldState.error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={cn(
                    "mt-4 px-4 py-3 rounded-xl",
                    "bg-destructive/10 border-2 border-destructive/20",
                    "flex items-center gap-3",
                  )}
                >
                  <AlertCircle className="w-5 h-5 text-destructive shrink-0" />
                  <p className="text-sm font-semibold text-destructive">
                    {fieldState.error.message || t("validation.selectType")}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </FormItem>
        )}
      />

      {/* ✨ Variant Type Selection - Only show when product type is selected */}
      <AnimatePresence>
        {productType && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
          >
            <FormField
              control={form.control}
              name="variant_type"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel className="text-xl font-black text-foreground mb-2 block">
                    {t("steps.variantType")} *
                  </FormLabel>
                  <p className="text-sm text-muted-foreground mb-4">
                    {t("steps.selectVariantTypeDescription")}
                  </p>

                  <FormControl>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {filteredVariantTypes.map((variant, index) => {
                        const isSelected =
                          form.watch("variant_type") === variant.value;

                        return (
                          <motion.button
                            key={variant.value}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.05 }}
                            type="button"
                            onClick={() =>
                              form.setValue("variant_type", variant.value, {
                                shouldValidate: true,
                              })
                            }
                            className={cn(
                              "p-4 rounded-xl border-2",
                              "transition-all duration-200 text-center",
                              "font-semibold",
                              isSelected
                                ? "border-primary bg-primary/10 text-primary shadow-lg scale-105"
                                : "border-primary/50 bg-elevated text-foreground hover:border-primary/40 hover:scale-102",
                            )}
                          >
                            {/* Translate Variant Type Label */}
                            {t(`variantTypes.${variant.value}`)}
                          </motion.button>
                        );
                      })}
                    </div>
                  </FormControl>

                  {/* ✨ Enhanced Error Message */}
                  <AnimatePresence>
                    {fieldState.error && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className={cn(
                          "mt-4 px-4 py-3 rounded-xl",
                          "bg-destructive/10 border-2 border-destructive/20",
                          "flex items-center gap-3",
                        )}
                      >
                        <AlertCircle className="w-5 h-5 text-destructive shrink-0" />
                        <p className="text-sm font-semibold text-destructive">
                          {fieldState.error.message ||
                            t("validation.selectVariantType")}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </FormItem>
              )}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

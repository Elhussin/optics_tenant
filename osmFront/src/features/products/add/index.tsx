/**
 * ✨ ProductAdd - النموذج الهجين (Hybrid Mode)
 * @description Steps wizard للإضافة + Tabs للتعديل مع Premium UI Design
 */

"use client";

import React, { useState, useCallback, useMemo } from "react";
import {
  Package,
  ArrowLeft,
  ArrowRight,
  Check,
  Loader2,
  Save,
  Sparkles,
} from "lucide-react";
import { Form } from "@/src/shared/components/shadcn/ui/form";
import { Button } from "@/src/shared/components/shadcn/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/src/shared/components/shadcn/ui/card";
import { useApiForm } from "@/src/shared/hooks/useApiForm";
import { useProductFormStore } from "@/src/features/products/store/useProductFormStore";
import { useProductRelations } from "@/src/features/products/hooks/useProductRelations";
import { Loading } from "@/src/shared/components/ui/loding";
import { Dialog } from "./components/Dialog";
import { cn } from "@/src/shared/utils/cn";
import { motion, AnimatePresence } from "framer-motion";
import { useLocale } from "next-intl";

// Premium UI Components
import { GlassCard } from "@/src/shared/components/ui/GlassCard";
import { Badge } from "@/src/shared/components/ui/Badge";

// Import sub-components
import { StepIndicator } from "./components/StepIndicator";
import { ProductTypeStep } from "./components/ProductTypeStep";
import { ProductInfoStep } from "./components/ProductInfoStep";
import { ProductVariantStep } from "./components/ProductVariantStep";
import { TabsLayout } from "./components/TabsLayout";
import { handleSave } from "../utils/handleSave";
import { veriantConfig } from "../constants/config";

export interface ProductAddProps {
  alias?: string;
  id?: string;
  initialData?: any;
}

const STEPS = [
  { id: 1, title: "نوع المنتج", description: "اختر نوع المنتج والتصنيف" },
  { id: 2, title: "المعلومات الأساسية", description: "أدخل بيانات المنتج" },
  { id: 3, title: "المتغيرات والأسعار", description: "أضف المتغيرات والتسعير" },
];

export function ProductAdd({ alias, id, initialData }: ProductAddProps) {
  const [currentStep, setCurrentStep] = useState(1);

  // ✨ Get current locale for RTL/LTR detection
  const locale = useLocale();
  const isRTL = locale === "ar";

  // ✨ Determine display mode: Steps for create, Tabs for edit
  const isEditMode = !!id;

  // Prepare default values
  const defaultValues = React.useMemo(() => {
    if (initialData) {
      return {
        ...initialData,
        id: id ? parseInt(id, 10) : undefined,
        categories: initialData.categories?.map((c: any) => c.id || c) || [],
        brand: initialData.brand?.id || initialData.brand,
      };
    }
    return isEditMode ? { id: id ? parseInt(id, 10) : undefined } : {};
  }, [initialData, id, isEditMode]);

  const form = useApiForm({
    alias:
      alias ||
      (isEditMode ? "products_products_update" : "products_products_create"),
    defaultValues,
    onSuccess: () => {
      if (!isEditMode) {
        setCurrentStep(1);
        form.reset();
      }
    },
  });

  const store = useProductFormStore();
  const { isLoading: isRelationsLoading } = useProductRelations();

  // Reset form with initialData when it changes (for edit mode)
  React.useEffect(() => {
    if (initialData && isEditMode) {
      form.reset({
        ...initialData,
        id: id ? parseInt(id, 10) : undefined,
        categories: initialData.categories?.map((c: any) => c.id || c) || [],
        brand: initialData.brand?.id || initialData.brand,
      });
    }
  }, [initialData, isEditMode]);

  // Watch key fields
  const [productType, variantType] = form.watch(["type", "variant_type"]);

  // Step validation
  const canProceedToStep2 = useMemo(() => {
    return !!productType;
  }, [productType]);

  const canProceedToStep3 = useMemo(() => {
    return !!productType && !!variantType;
  }, [productType, variantType]);

  const handleNext = useCallback(() => {
    if (currentStep < 3) {
      setCurrentStep((prev) => prev + 1);
    }
  }, [currentStep]);

  const handleBack = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  }, [currentStep]);

  const handleSubmit = useCallback(() => {
    handleSave(
      form,
      form.getValues("variants"),
      veriantConfig(variantType),
      id
    );
  }, [form, variantType, id]);

  if (form.formState.isLoading || isRelationsLoading) {
    return <Loading />;
  }

  return (
    <div className={cn("min-h-screen py-8", "bg-background")}>
      <div className="container mx-auto px-4 max-w-5xl">
        {/* ✨ Enhanced Header with Glassmorphism */}
        <div className="relative mb-8">
          {/* Gradient Background Glow */}
          <div className="absolute -inset-2 bg-gradient-to-r from-primary/20 via-secondary/20 to-primary/20 blur-2xl opacity-30 -z-10" />

          <GlassCard className="border-none overflow-visible" padding="sm">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              {/* Title Section */}
              <div className="space-y-2 text-center sm:text-start flex-1">
                <div className="flex items-center justify-center sm:justify-start gap-3 flex-wrap">
                  <div
                    className={cn(
                      "inline-flex items-center justify-center",
                      "w-12 h-12 rounded-xl",
                      "bg-gradient-to-br from-primary to-blue-600",
                      "text-white shadow-lg shadow-primary/30"
                    )}
                  >
                    <Package className="w-6 h-6" />
                  </div>
                  <h1 className="text-3xl font-bold flex items-center gap-2">
                    <Sparkles className="w-7 h-7 text-primary" />
                    {isEditMode ? "تعديل المنتج" : "إضافة منتج جديد"}
                  </h1>
                  <Badge variant={isEditMode ? "warning" : "success"}>
                    {isEditMode ? "وضع التعديل" : "وضع الإضافة"}
                  </Badge>
                </div>

                <p className="text-sm text-secondary">
                  {isEditMode
                    ? "قم بتعديل بيانات المنتج وحفظ التغييرات"
                    : "اتبع الخطوات لإضافة منتج جديد إلى المتجر"}
                </p>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Form Container */}
        <Form {...form}>
          <form onSubmit={(e) => e.preventDefault()}>
            {/* ✨ Conditional Rendering: Tabs for Edit, Steps for Create */}
            {isEditMode ? (
              <>
                {/* ✨ Tabs Layout for Edit Mode */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <TabsLayout
                    form={form}
                    productType={productType}
                    variantType={variantType}
                  />

                  {/* ✨ Enhanced Save Button for Edit Mode */}
                  <div className="mt-6 flex justify-end">
                    <Button
                      type="button"
                      onClick={handleSubmit}
                      disabled={form.isBusy}
                      className={cn(
                        "gap-2 px-8 py-6 text-base font-bold",
                        "bg-gradient-to-r from-primary to-blue-600",
                        "hover:shadow-xl hover:shadow-primary/40",
                        "transition-all hover:scale-105"
                      )}
                    >
                      {form.isBusy ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          جارٍ الحفظ...
                        </>
                      ) : (
                        <>
                          <Save className="w-5 h-5" />
                          حفظ التغييرات
                        </>
                      )}
                    </Button>
                  </div>
                </motion.div>
              </>
            ) : (
              <>
                {/* ✨ Steps Layout for Create Mode */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  {/* Step Indicator */}
                  <StepIndicator steps={STEPS} currentStep={currentStep} />

                  {/* ✨ Enhanced Card */}
                  <Card
                    className={cn(
                      "mt-8 border-none",
                      "bg-elevated/50 backdrop-blur-sm",
                      "shadow-2xl rounded-3xl overflow-hidden"
                    )}
                  >
                    <CardHeader
                      className={cn(
                        "border-b-2 border-primary/50",
                        "bg-elevated/50 backdrop-blur-md",
                        "p-6"
                      )}
                    >
                      <CardTitle className="text-2xl  font-black text-foreground">
                        {STEPS[currentStep - 1].title}
                      </CardTitle>
                      <CardDescription className="text-muted-foreground text-base">
                        {STEPS[currentStep - 1].description}
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="p-6">
                      {/* Step 1: Product Type */}
                      {currentStep === 1 && (
                        <ProductTypeStep
                          form={form}
                          productType={productType}
                        />
                      )}

                      {/* Step 2: Product Info */}
                      {currentStep === 2 && (
                        <ProductInfoStep
                          form={form}
                          productType={productType}
                        />
                      )}

                      {/* Step 3: Variants */}
                      {currentStep === 3 && (
                        <ProductVariantStep
                          form={form}
                          productType={productType}
                          variantType={variantType}
                        />
                      )}
                    </CardContent>

                    {/* ✨ Enhanced Footer Navigation */}
                    <div
                      className={cn(
                        "px-6 py-4",
                        "border-t-2 border-primary/50",
                        "bg-elevated/30 backdrop-blur-sm",
                        "flex items-center justify-between"
                      )}
                    >
                      {/* Back Button */}
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleBack}
                        disabled={currentStep === 1}
                        className="gap-2"
                      >
                        {/* ✨ Arrow changes based on locale */}
                        {isRTL ? (
                          <ArrowRight className="w-4 h-4" />
                        ) : (
                          <ArrowLeft className="w-4 h-4" />
                        )}
                        السابق
                      </Button>

                      {/* Next / Submit Button */}
                      {currentStep < 3 ? (
                        <Button
                          type="button"
                          onClick={handleNext}
                          disabled={
                            (currentStep === 1 && !canProceedToStep2) ||
                            (currentStep === 2 && !canProceedToStep3)
                          }
                          className={cn(
                            "gap-2",
                            "bg-primary hover:bg-primary/90",
                            "hover:scale-105 transition-all"
                          )}
                        >
                          التالي
                          {/* ✨ Arrow changes based on locale */}
                          {isRTL ? (
                            <ArrowLeft className="w-4 h-4" />
                          ) : (
                            <ArrowRight className="w-4 h-4" />
                          )}
                        </Button>
                      ) : (
                        <Button
                          type="button"
                          onClick={handleSubmit}
                          disabled={form.isBusy}
                          className={cn(
                            "gap-2 min-w-[140px]",
                            "bg-gradient-to-r from-success to-green-600",
                            "hover:shadow-xl hover:shadow-success/40",
                            "hover:scale-105 transition-all"
                          )}
                        >
                          {form.isBusy ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              جارٍ الحفظ...
                            </>
                          ) : (
                            <>
                              <Check className="w-4 h-4" />
                              حفظ المنتج
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </Card>
                </motion.div>
              </>
            )}
          </form>
        </Form>

        {/* Dialog for adding new entities */}
        <Dialog setValue={form.setValue} />
      </div>
    </div>
  );
}

export default ProductAdd;

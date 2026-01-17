/**
 * ✨ TabsLayout - للتعديل (Edit Mode) - Premium UI Design
 * @description Tabs layout for editing existing products مع GlassCard، animations، و indicators
 */

"use client";

import React from "react";
import { UseFormReturn } from "react-hook-form";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/src/shared/components/shadcn/ui/tabs";
import { Package, Info, Tags, CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/src/shared/utils/cn";
import { ProductTypeStep } from "./ProductTypeStep";
import { ProductInfoStep } from "./ProductInfoStep";
import { ProductVariantStep } from "./ProductVariantStep";
import { motion, AnimatePresence } from "framer-motion";
import { GlassCard } from "@/src/shared/components/ui/GlassCard";

interface TabsLayoutProps {
  form: UseFormReturn<any>;
  productType: string;
  variantType: string;
}

export function TabsLayout({
  form,
  productType,
  variantType,
}: TabsLayoutProps) {
  // Check completion for each tab
  const isTypeComplete = !!productType && !!variantType;
  const hasInfoErrors =
    !!form.formState.errors?.name || !!form.formState.errors?.price;
  const hasVariantErrors = !!form.formState.errors?.variants;

  return (
    <Tabs defaultValue="type" className="w-full">
      {/* ✨ Enhanced Tabs List */}
      <TabsList
        className={cn(
          "grid w-full grid-cols-3 p-1.5 gap-2",
          "bg-elevated/50 backdrop-blur-md rounded-2xl",

          "shadow-lg",
          "mb-8"
        )}
      >
        {/* Tab 1: Type */}
        <TabsTrigger
          value="type"
          className={cn(
            "relative flex items-center justify-center gap-2 py-3.5 px-4",
            "rounded-xl font-bold",
            "data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-blue-600",
            "data-[state=active]:text-white",
            "data-[state=active]:shadow-xl data-[state=active]:shadow-primary/40",
            "data-[state=inactive]:text-muted-foreground",
            "data-[state=inactive]:hover:bg-background data-[state=inactive]:hover:text-foreground",
            "transition-all duration-300",
            "data-[state=active]:scale-105"
          )}
        >
          <Package className="w-5 h-5" />
          <span className="hidden sm:inline">نوع المنتج</span>

          {/* ✨ Completion Badge */}
          {isTypeComplete && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 500 }}
              className="absolute -top-1 -end-1"
            >
              <CheckCircle2 className="w-5 h-5 text-success bg-background rounded-full" />
            </motion.div>
          )}
        </TabsTrigger>

        {/* Tab 2: Info */}
        <TabsTrigger
          value="info"
          className={cn(
            "relative flex items-center justify-center gap-2 py-3.5 px-4",
            "rounded-xl font-bold",
            "data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-blue-600",
            "data-[state=active]:text-white",
            "data-[state=active]:shadow-xl data-[state=active]:shadow-primary/40",
            "data-[state=inactive]:text-muted-foreground",
            "data-[state=inactive]:hover:bg-background data-[state=inactive]:hover:text-foreground",
            "transition-all duration-300",
            "data-[state=active]:scale-105"
          )}
        >
          <Info className="w-5 h-5" />
          <span className="hidden sm:inline">المعلومات</span>

          {/* ✨ Error Badge */}
          {hasInfoErrors && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1, rotate: [0, -10, 10, -10, 0] }}
              transition={{ type: "spring", stiffness: 500 }}
              className="absolute -top-1 -end-1"
            >
              <AlertCircle className="w-5 h-5 text-destructive bg-background rounded-full" />
            </motion.div>
          )}
        </TabsTrigger>

        {/* Tab 3: Variants */}
        <TabsTrigger
          value="variants"
          className={cn(
            "relative flex items-center justify-center gap-2 py-3.5 px-4",
            "rounded-xl font-bold",
            "data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-blue-600",
            "data-[state=active]:text-white",
            "data-[state=active]:shadow-xl data-[state=active]:shadow-primary/40",
            "data-[state=inactive]:text-muted-foreground",
            "data-[state=inactive]:hover:bg-background data-[state=inactive]:hover:text-foreground",
            "transition-all duration-300",
            "data-[state=active]:scale-105"
          )}
        >
          <Tags className="w-5 h-5" />
          <span className="hidden sm:inline">المتغيرات</span>

          {/* ✨ Error Badge */}
          {hasVariantErrors && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1, rotate: [0, -10, 10, -10, 0] }}
              transition={{ type: "spring", stiffness: 500 }}
              className="absolute -top-1 -end-1"
            >
              <AlertCircle className="w-5 h-5 text-destructive bg-background rounded-full" />
            </motion.div>
          )}
        </TabsTrigger>
      </TabsList>

      {/* ✨ Enhanced Tab Contents with Animations */}
      <AnimatePresence mode="wait">
        <TabsContent value="type" className="mt-0">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="relative group"
          >
            {/* Background glow on hover */}
            <div className="absolute -inset-1 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10" />
            
            <GlassCard className="overflow-hidden shadow-xl hover:shadow-2xl transition-shadow duration-300">
              <ProductTypeStep form={form} productType={productType} />
            </GlassCard>
          </motion.div>
        </TabsContent>

        <TabsContent value="info" className="mt-0">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="relative group"
          >
            {/* Background glow on hover */}
            <div className="absolute -inset-1 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10" />
            
            <GlassCard className="overflow-hidden shadow-xl hover:shadow-2xl transition-shadow duration-300">
              <ProductInfoStep form={form} productType={productType} />
            </GlassCard>
          </motion.div>
        </TabsContent>

        <TabsContent value="variants" className="mt-0">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="relative group"
          >
            {/* Background glow on hover */}
            <div className="absolute -inset-1 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10" />
            
            <GlassCard className="overflow-hidden shadow-xl hover:shadow-2xl transition-shadow duration-300">
              <ProductVariantStep
                form={form}
                productType={productType}
                variantType={variantType}
              />
            </GlassCard>
          </motion.div>
        </TabsContent>
      </AnimatePresence>
    </Tabs>
  );
}

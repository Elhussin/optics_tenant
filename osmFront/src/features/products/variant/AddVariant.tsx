"use client";

import React, { useState, useCallback, useMemo } from "react";
import { Package, ArrowLeft, Check, Loader2 } from "lucide-react";
import { Form } from "@/src/shared/components/shadcn/ui/form";
import { Button } from "@/src/shared/components/shadcn/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/src/shared/components/shadcn/ui/card";
import { useApiForm } from "@/src/shared/hooks/useApiForm";

import { useProductRelations } from "@/src/features/products/hooks/useProductRelations";
import { SectionLoading } from "@/src/shared/components/ui/Spinner";
import { RenderFields } from "@/src/shared/components/field/RenderFields";
import { veriantConfig } from "../constants/config";
import { safeToast } from "@/src/shared/utils/safeToast";
import { ActionButton } from "@/src/shared/components/ui/buttons";
import { useTranslations } from "next-intl";

interface AddVariantProps {
  productId: number;
  variantType: string;
  productType: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function AddVariant({
  productId,
  variantType,
  productType,
  onSuccess,
  onCancel,
}: AddVariantProps) {
  const t = useTranslations("products");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useApiForm({
    alias: "products_variants_create",
    defaultValues: {
      product: productId,
    },
    onSuccess: () => {
      safeToast(t("validation.variantAddedSuccess"), { type: "success" });
      form.reset();
      onSuccess?.();
    },
    onError: (error) => {
      safeToast(
        t("validation.variantAddError", {
          error: error?.message || t("validation.error"),
        }),
        {
          type: "error",
        },
      );
    },
  });

  const { isLoading: isRelationsLoading } = useProductRelations();

  // Get variant config based on variant type
  const variantFields = useMemo(() => {
    return veriantConfig(variantType).map((item) => ({
      ...item,
      label: t(`fields.${item.name}`) || item.label,
      placeholder: t(`fields.${item.name}`) || item.placeholder,
    }));
  }, [variantType, t]);

  const handleSubmit = useCallback(async () => {
    // ... logic ...
    setIsSubmitting(true);
    try {
      const values = form.getValues();
      console.log("🔍 Form values:", values);

      // Extract variant data from variants array
      let variantData = {};
      if (
        values.variants &&
        Array.isArray(values.variants) &&
        values.variants.length > 0
      ) {
        // Get the first variant data
        variantData = values.variants[0];
        console.log("📦 Extracted variant data:", variantData);
      }

      // Build the final payload - merge variant data directly (no variants wrapper)
      const payload: Record<string, any> = {
        product: productId,
        ...variantData, // Spread variant fields directly
      };

      // Remove undefined values
      Object.keys(payload).forEach((key) => {
        if (payload[key] === undefined) {
          delete payload[key];
        }
      });

      console.log("📤 Final payload being sent:", payload);
      console.log("📍 Product ID:", productId);

      const result = await form.submitForm(payload);

      console.log("📥 Result:", result);

      if (!result.success) {
        console.error("❌ Submit failed:", result.error);
      } else {
        console.log("✅ Submit successful!");
      }
    } catch (error) {
      console.error("💥 Exception during submit:", error);
    } finally {
      setIsSubmitting(false);
    }
  }, [form, productId]);

  if (form.formState.isLoading || isRelationsLoading) {
    return <SectionLoading />;
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Package className="w-5 h-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-lg">{t("variants.addNew")}</CardTitle>
            <CardDescription>
              {t("variants.addVariantDescription", { type: variantType })}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
            className="space-y-6"
          >
            {/* Variant Fields */}
            <RenderFields
              fields={variantFields}
              form={form}
              selectedType={productType}
              variantNumber={0}
            />

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t">
              {onCancel && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  className="flex-1"
                >
                  <ArrowLeft className="w-4 h-4 ml-2" />
                  {t("actions.cancel")}
                </Button>
              )}
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-primary hover:bg-primary/90"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin ml-2" />
                    {t("actions.adding")}
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 ml-2" />
                    {t("variants.add")}
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

export default AddVariant;

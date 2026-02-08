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
import { veriantConfig } from "../../constants/config";
import { safeToast } from "@/src/shared/utils/safeToast";
import { useTranslations } from "next-intl";
import { formsConfig } from "@/src/shared/constants/entityConfig";
interface AddVariantProps {
  productId: number;
  variantType: string;
  productType: string;
  onSuccess?: () => void;
  onCancel?: () => void;
  variantId?: number;
  initialData?: Record<string, any>;
}

export function AddVariant({
  productId,
  variantType,
  productType,
  onSuccess,
  onCancel,
  variantId,
  initialData,
}: AddVariantProps) {
  const t = useTranslations("products");
  const [isSubmitting, setIsSubmitting] = useState(false);
  console.log("variantType", initialData);
  const form = useApiForm({
    alias: variantId
      ? formsConfig["product-variants"].partialUpdateAlias
      : formsConfig["product-variants"].createAlias,
    defaultValues: initialData || {
      product: productId,
    },
    enabled: true, // Always enabled as we either create or have initialData
    onSuccess: () => {
      safeToast(
        variantId
          ? t("variants.variantUpdatedSuccess")
          : t("variants.variantAddedSuccess"),
        { type: "success" },
      );
      if (!variantId) form.reset(); // Only reset on create
      onSuccess?.();
    },
    onError: (error) => {
      safeToast(
        t("variants.variantAddError", {
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

      // Build the final payload - flat structure
      const payload: Record<string, any> = {
        product: productId,
        ...values,
      };

      // Remove undefined values
      Object.keys(payload).forEach((key) => {
        if (payload[key] === undefined) {
          delete payload[key];
        }
      });

    

      const result = await form.submitForm(payload);


      if (!result.success) {
        safeToast(
          t("variants.variantAddError", {
            error: result.error?.message || t("validation.error"),
          }),
          {
            type: "error",
          },
        );
      } else {
        safeToast(
          t("variants.variantAddedSuccess", {
            error: result.error?.message || t("validation.error"),
          }),
          {
            type: "success",
          },
        );
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
            <CardTitle className="text-lg">
              {variantId ? t("variants.editVariant") : t("variants.addNew")}
            </CardTitle>
            <CardDescription>
              {variantId
                ? t("variants.editVariantDescription", { type: variantType })
                : t("variants.addVariantDescription")}
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
                    {variantId ? t("actions.editVariant") : t("actions.save")}
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

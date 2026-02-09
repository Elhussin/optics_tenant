"use client";

import React, { useEffect } from "react";
import { NotFound } from "@/src/shared/components/views/NotFound";
import { useApiForm } from "@/src/shared/hooks/useApiForm";
import { ActionButton } from "@/src/shared/components/ui/buttons";
import {
  Pencil,
  Package,
  Tag,
  Barcode,
  Layers,
  CircleDollarSign,
  Info,
} from "lucide-react";
import { motion } from "framer-motion";
import { GlassCard } from "@/src/shared/components/ui/GlassCard";
import { Badge } from "@/src/shared/components/ui/Badge";
import { cn } from "@/src/shared/utils/cn";
import { useTranslations } from "next-intl";
import { InfoItem } from "../../../../shared/components/ui/InfoItem";
import { SectionLoading } from "@/src/shared/components/ui/Spinner";
import { PageHeader } from "@/src/shared/components/ui/PageHeader";
import { formsConfig } from "@/src/shared/constants/formsConfig";

interface VariantViewProps {
  productId: string;
  variantId: string;
}

export function VariantView({ productId, variantId }: VariantViewProps) {
  const t = useTranslations("products");
  const numericId = parseInt(variantId, 10);

  const { query, isBusy } = useApiForm({
    alias: formsConfig["product-variants"].retrieveAlias || "",
    defaultValues: { id: numericId },
    enabled: !isNaN(numericId),
  });

  const { data: variant, isLoading, isError } = query;

  useEffect(() => {
    if (!isNaN(numericId)) {
      query.refetch();
    }
  }, [numericId]);

  if (isLoading || isBusy) {
    return <SectionLoading />;
  }

  if (isError || !variant) {
    return <NotFound error={t("view.variantNotFound")} />;
  }
  console.log(variant.description);
  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <PageHeader
        title={variant.product_name || `${variant.brand_name} ${variant.model}`}
        description={variant.description || t("view.variantDetails")}
        icon={<Layers />}
        backUrl={`/dashboard/products/${productId}`}
        backTitle={t("actions.backToProduct")}
        badge={<Badge variant="primary">{variant.product_type_name}</Badge>}
      >
        <ActionButton
          label={t("actions.editVariant")}
          icon={<Pencil size={16} />}
          variant="outline"
          navigateTo={`/dashboard/products/${productId}/variants/${variantId}/edit`}
          className="shadow-lg shadow-primary/10 hover:shadow-primary/20"
        />
      </PageHeader>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
      >
        <GlassCard padding="md">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <InfoItem
              icon={<Tag size={18} />}
              label={t("fields.sku")}
              value={variant.sku || "-"}
            />
            <InfoItem
              icon={<Barcode size={18} />}
              label={t("fields.barcode")}
              value={variant.barcode || "-"}
            />
            <InfoItem
              icon={<CircleDollarSign size={18} />}
              label={t("fields.price")}
              value={`${variant.selling_price} ${variant.currency || ""}`}
            />
            <InfoItem
              icon={<Layers size={18} />}
              label={t("fields.quantity")}
              value={variant.stock_quantity || "0"}
            />
            {/* Add more dynamic fields based on variant type if needed */}
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
}

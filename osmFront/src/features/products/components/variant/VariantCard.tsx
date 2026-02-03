
import { Badge } from "@/src/shared/components/ui/Badge";
import { cn } from "@/src/shared/utils/cn";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { ActionButton } from "@/src/shared/components/ui/buttons";
import { Pencil } from "lucide-react";

// ✨ Variant Card Component - Premium Design
export function VariantCard({ variant, index }: { variant: any; index: number }) {
  const t = useTranslations("products");
  console.log(variant);
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
            {t("variants.variantLabel", { number: index + 1 })}
          </Badge>
          <span className="text-xs text-secondary font-mono">
            {variant.sku || "-"}
          </span>
        </div>

        <div className="space-y-3 text-sm">
          <div className="flex justify-between items-center">
            <span className="text-secondary">{t("fields.sellingPrice")}:</span>
            <span className="font-bold text-primary text-base">
              {variant.selling_price ? `${variant.selling_price} ` : "-"}
            </span>
          </div>

          {variant.discount_percentage > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-secondary">{t("fields.discount")}:</span>
              <Badge variant="success" className="text-xs">
                {variant.discount_percentage}%
              </Badge>
            </div>
          )}

          {variant.last_purchase_price && (
            <div className="flex justify-between items-center">
              <span className="text-secondary">
                {t("fields.purchasePrice")}:
              </span>
              <span className="font-medium">{variant.last_purchase_price}</span>
            </div>
          )}

          {variant.description && (
            <div className="pt-3 border-t border-primary/20">
              <p className="text-xs text-secondary mb-1">
                {t("fields.description")}:
              </p>
              <p className="text-sm text-foreground line-clamp-2">
                {variant.description}
              </p>
            </div>
          )}
          <ActionButton
            label={t("actions.editVariant")}
            icon={<Pencil size={16} />}
            variant="outline"
            navigateTo={`/dashboard/products/${variant.product}/variants/${variant.id}/edit`}
            className="hover:scale-105 transition-transform"
          />
                    <ActionButton
            label={t("actions.view")}
            icon={<Pencil size={16} />}
            variant="outline"
            navigateTo={`/dashboard/products/${variant.product}/variants/${variant.id}`}
            className="hover:scale-105 transition-transform"
          />
        </div>
      </div>
    </motion.div>
  );
}



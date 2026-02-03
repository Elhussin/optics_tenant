/**
 * ✨ AttributesSection - محسّن مع Animations و UI/UX Enhancements
 * @description Custom attributes for product variants مع enhanced design
 */

import { useFieldArray } from "react-hook-form";
import { Button } from "@/src/shared/components/shadcn/ui/button";
import { RenderFields } from "@/src/shared/components/field/RenderFields";
import { CustomVariantConfig } from "@/src/features/products/constants/config";
import { Plus, Trash2, Sparkles, Tag } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/shared/components/shadcn/ui/card";
import { cn } from "@/src/shared/utils/cn";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";

// ... (imports)
interface AttributesSectionProps {
  variantIndex: number;
  form: any;
}
export const AttributesSection = ({
  variantIndex,
  form,
}: AttributesSectionProps) => {
  const t = useTranslations("products");
  // إدارة الـ attributes الخاصة بكل variant
  const {
    fields: attributes,
    append: addAttr,
    remove: removeAttr,
  } = useFieldArray({
    control: form.control,
    name: `variants.${variantIndex}.attributes`,
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-4 pt-6"
    >
      {/* ✨ Enhanced Header */}
      <div
        className={cn(
          "flex items-center justify-between",
          "p-4 rounded-xl",
          "bg-primary/5 border-2 border-primary/10",
        )}
      >
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "w-10 h-10 rounded-lg",
              "bg-gradient-to-br from-purple-500 to-indigo-600",
              "flex items-center justify-center",
            )}
          >
            <Tag className="w-5 h-5 text-white" />
          </div>
          <div>
            <h4 className="text-base font-black text-foreground">
              {t("attributes.title")}
            </h4>
            <p className="text-xs text-muted-foreground">
              {t("attributes.count", { count: attributes.length })}
            </p>
          </div>
        </div>

        <Button
          type="button"
          onClick={() => addAttr({ key: "", value: "" })}
          variant="outline"
          size="sm"
          className={cn(
            "gap-2",
            "border-2 border-primary/30",
            "text-primary hover:bg-primary/10",
            "hover:scale-105 transition-all",
          )}
        >
          <Plus size={16} />
          <span className="hidden sm:inline">{t("attributes.add")}</span>
        </Button>
      </div>

      {/* ✨ Enhanced Attributes Grid */}
      <AnimatePresence mode="popLayout">
        {attributes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {attributes.map((attr, attrIndex) => (
              <motion.div
                key={attr.id || attrIndex}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                layout
              >
                <Card
                  className={cn(
                    "relative overflow-hidden group",
                    "border-2 border-dashed border-border",
                    "hover:border-solid hover:border-primary/30",
                    "transition-all duration-300",
                    "hover:shadow-lg",
                  )}
                >
                  {/* ✨ Delete Button */}
                  <div
                    className={cn(
                      "absolute top-3 end-3 z-10",
                      "opacity-0 group-hover:opacity-100",
                      "transition-opacity duration-200",
                    )}
                  >
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className={cn(
                        "h-8 w-8 rounded-full",
                        "text-destructive hover:bg-destructive/10",
                        "hover:scale-110 transition-all",
                      )}
                      onClick={() => removeAttr(attrIndex)}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>

                  {/* ✨ Card Header */}
                  <CardHeader className="p-4 pb-2">
                    <CardTitle
                      className={cn(
                        "text-sm font-bold",
                        "text-foreground",
                        "flex items-center gap-2",
                      )}
                    >
                      <span
                        className={cn(
                          "h-2 w-2 rounded-full",
                          "bg-gradient-to-r from-purple-500 to-indigo-600",
                        )}
                      />
                      {t("attributes.attributeLabel", {
                        number: attrIndex + 1,
                      })}
                    </CardTitle>
                  </CardHeader>

                  {/* ✨ Card Content */}
                  <CardContent className="p-4 pt-2">
                    <RenderFields
                      fields={CustomVariantConfig}
                      form={form}
                      variantNumber={variantIndex}
                      attributeIndex={attrIndex}
                    />
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          /* ✨ Empty State */
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className={cn(
              "text-center py-12",
              "border-2 border-dashed rounded-2xl",
              "border-border bg-elevated/50",
              "hover:bg-elevated transition-colors",
            )}
          >
            <div
              className={cn(
                "w-16 h-16 rounded-2xl mx-auto mb-4",
                "bg-gradient-to-br from-purple-500/10 to-indigo-600/10",
                "flex items-center justify-center",
              )}
            >
              <Sparkles className="w-8 h-8 text-purple-500" />
            </div>

            <p className="text-muted-foreground text-sm mb-4">
              {t("attributes.noAttributes")}
            </p>

            <Button
              type="button"
              variant="ghost"
              onClick={() => addAttr({ key: "", value: "" })}
              className={cn(
                "text-primary hover:bg-primary/10",
                "gap-2 hover:scale-105 transition-all",
              )}
            >
              <Plus className="w-4 h-4" />
              {t("attributes.addFirst")}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

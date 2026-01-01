import { useFieldArray, useFormContext } from "react-hook-form";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/src/shared/components/shadcn/ui/accordion";
import { Button } from "@/src/shared/components/shadcn/ui/button";
import { RenderFields } from "@/src/shared/components/field/RenderFields";
import { useProductFormStore } from "@/src/features/products/store/useProductFormStore";
import { veriantConfig } from "@/src/features/products/constants/config";
import { CustomVariantMainConfig } from "@/src/features/products/constants/config";
import { AttributesSection } from "./AttributesSection";

export const VariantRender = ({ variant_type, productType,form }: any) => {
  const store = useProductFormStore();


  // قائمة الـ variants
  const { fields: variants, append: addVariant } = useFieldArray({
    control:form.control,
    name: "variants",
  });

  return (
    <div className="space-y-4">
    <Accordion
      type="single"
      collapsible
      className="w-full space-y-4"
      value={store.openVariantIndex !== null ? String(store.openVariantIndex) : undefined}
      onValueChange={(val) => {
        const idx = val ? Number(val) : null;
        store.setOpenVariantIndex(idx);
      }}
    >
      {variants.map((variant, variantIndex) => (
        <AccordionItem 
            key={variant.id || variantIndex} 
            value={String(variantIndex)}
            className="border rounded-xl bg-white dark:bg-gray-800 shadow-sm overflow-hidden px-2"
        >
          <AccordionTrigger className="hover:no-underline py-4 px-2">
            <div className="flex items-center gap-4 w-full">
                <span className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 font-bold text-sm">
                    {variantIndex + 1}
                </span>
                <div className="text-left flex-1">
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100">Variant #{variantIndex + 1}</h4>
                    <p className="text-xs text-gray-500 font-normal">Click to expand details</p>
                </div>
            </div>
          </AccordionTrigger>

          <AccordionContent className="p-4 pt-0 border-t border-gray-100 dark:border-gray-700 mt-2">
            <div className="py-4 space-y-6">
                {/* --- حقول الـ variant الأساسية --- */}
                <RenderFields
                    form={form}
                    fields={variant_type === "custom" ? CustomVariantMainConfig : veriantConfig(variant_type)}
                    variantNumber={variantIndex}
                    selectedType={productType}
                />

                {/* --- الحقول الخاصة بالـ attributes داخل هذا الـ variant --- */}
                <AttributesSection variantIndex={variantIndex} form={form}/>
            </div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>

      <Button
        type="button"
        variant="outline"
        onClick={() => addVariant({ name: "", sku: "", attributes: [] })}
        className="w-full border-dashed border-2 py-6 text-gray-500 hover:text-blue-600 hover:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all font-semibold gap-2"
      >
        <span className="h-6 w-6 rounded-full border-2 border-current flex items-center justify-center pb-0.5 text-lg leading-none">+</span>
        Add Another Variant
      </Button>
    </div>
  );
};

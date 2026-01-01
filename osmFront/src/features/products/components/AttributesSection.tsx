import { useFieldArray } from "react-hook-form";
import { Button } from "@/src/shared/components/shadcn/ui/button";
import { RenderFields } from "../../../shared/components/field/RenderFields";
import { CustomVariantConfig } from "@/src/features/products/constants/config";
import { Plus, Trash2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/shared/components/shadcn/ui/card";

export const AttributesSection = ({ variantIndex, form }: { variantIndex: number, form: any }) => {
  // إدارة الـ attributes الخاصة بكل variant
  const { fields: attributes, append: addAttr, remove: removeAttr } = useFieldArray({
    control: form.control,
    name: `variants.${variantIndex}.attributes`,
  });

  return (
    <div className="space-y-4 pt-4">
       <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold uppercase text-gray-500 tracking-wider">Additional Attributes</h4>
           <Button
            type="button"
            onClick={() => addAttr({ key: "", value: "" })}
            variant="outline"
            size="sm"
            className="gap-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 border-blue-200 dark:border-blue-800"
          >
            <Plus size={16} /> Add Attribute
          </Button>
       </div>
       
       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {attributes.map((attr, attrIndex) => (
            <Card key={attr.id || attrIndex} className="relative overflow-hidden group border-dashed hover:border-solid transition-colors">
                 <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                     <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-500 hover:bg-red-50 hover:text-red-600 rounded-full"
                        onClick={() => removeAttr(attrIndex)}
                    >
                        <Trash2 size={16} />
                    </Button>
                </div>
                <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-indigo-500"></span>
                        Attribute #{attrIndex + 1}
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-2">
                    <RenderFields
                        fields={CustomVariantConfig}
                        form={form}
                        variantNumber={variantIndex}
                        attributeIndex={attrIndex}
                    />
                </CardContent>
            </Card>
        ))}
       </div>
        {attributes.length === 0 && (
             <div className="text-center py-8 border-2 border-dashed rounded-xl border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
                <p className="text-gray-500 text-sm">No custom attributes added yet.</p>
                <Button
                    type="button"
                    variant="link"
                    onClick={() => addAttr({ key: "", value: "" })}
                    className="text-blue-600"
                >
                    Add your first attribute
                </Button>
             </div>
        )}
    </div>
  );
};

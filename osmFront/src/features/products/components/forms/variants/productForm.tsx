
"use client"
import { Form } from "@/src/shared/components/shadcn/ui/form";
import { Button } from "@/src/shared/components/shadcn/ui/button";
import { useApiForm } from "@/src/shared/hooks/useApiForm";
import { useProductFormStore } from "@/src/features/product/store/useProductFormStore";
import { useProductRelations } from "@/src/features/product/hooks/useProductRelations";
import { useMemo } from "react";
import { ProductConfig, MainFieldConfig,veriantConfig } from "@/src/features/products/constants/config";
import { handleSave } from "./handleSave";
import { RenderFields } from "./RenderFields";
import { Loading } from '@/src/shared/components/ui/loding';
import { Dialog } from "./Dialog";
import { useEffect } from "react";

export const ProductForm = ({ alias, id }: { alias: string, id?: string }) => {
    const defaultValues = {
        name: "",
        type: "",
        variant_type: "basic",
        variant_count: 1,
        is_active: true,
        // brand: "",
        // model: "",
    };
    const form = useApiForm({ alias: alias || "products_products_create", defaultValues });
    const store = useProductFormStore();
    const { isLoading } = useProductRelations();
    const [productType, brand, model, variant_count,variant_type] = form.watch(["type", "brand", "model", "variant_count","variant_type"]);
    const isComplete = useMemo(
        () => [productType, brand, model].every(
            (v) => v !== null && v !== undefined && v !== ""
        ),
        [productType, brand, model]
    );


    const filteredConfig = ProductConfig.filter(item => {
        return item.role === "all" || item.role === productType;
    });

    const submitText= id?"Update":"Save";

    useEffect(() => {
        store.setVariantCount(variant_count);

    }, [variant_count]);

    const toggleVariantOptions = () => {
        store.setIsVariant(!store.isVariant);
        if (!store.isVariant) {
            store.setOpenVariantIndex(0);
        }
    };

    if (isLoading) return <Loading />;
    return (
        <>
            <Form {...form}>
                <form onSubmit={(e) => e.preventDefault()} className="space-y-6 p-4 border rounded-lg max-w-xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <RenderFields fields={MainFieldConfig} form={form} variantNumber={undefined}/>
                        {productType && <RenderFields fields={ProductConfig} form={form} selectedType={productType} variantNumber={undefined} />}
                    </div>
                    <div>
                        {store.isVariant &&
                            Array.from({ length: store.variantCount }).map((_, i) => (
                                // className="grid grid-cols-1 md:grid-cols-2 gap-4"
                                <div key={i}  >
                                    <h2
                                        className='font-bold border-b-2 border-gray-200 mb-1 p-1 cursor-pointer'
                                        onClick={() => store.toggleVariant(i)}
                                    >
                                        Variant {i + 1}
                                    </h2>
                                    {store.openVariantIndex === i && (
                                        variant_type &&
                                        <RenderFields
                                            fields={veriantConfig(variant_type)}
                                            form={form}
                                            selectedType={productType}
                                            variantNumber={i} 
                                        />
                                    )}
                                </div>
                            ))}
                    </div>


                    {/* Submit Button */}
                    <div className="flex gap-3 pt-4 ">
                        {store.isVariant && (
                        <Button
                            type="button"
                            onClick={() => handleSave(form, store.variants, filteredConfig)}
                            disabled={form.isSubmitting}
                            className={`bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium transition-colors ${form.isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {form.isSubmitting ? 'Saving...' :submitText}
                        </Button>
                        )}

                        <Button
                            type="button"
                            onClick={() => toggleVariantOptions()}
                            disabled={!isComplete}
                            className={`px-6 py-2 rounded-md font-medium transition-colors ${!isComplete
                                ? "bg-gray-400 cursor-not-allowed"
                                : "bg-blue-600 hover:bg-blue-700 text-white"
                                }`}
                        >
                            {store.isVariant ? "Back" : "Next"}
                        </Button>
                    </div>
                </form>
            </Form>
            <Dialog setValue={form.setValue} />
        </>
    );
};

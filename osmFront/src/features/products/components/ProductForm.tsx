
// "use client"
// import { Form } from "@/src/shared/components/shadcn/ui/form";
// import { Button } from "@/src/shared/components/shadcn/ui/button";
// import { useApiForm } from "@/src/shared/hooks/useApiForm";
// import { useProductFormStore } from "@/src/features/products/store/useProductFormStore";
// import { useProductRelations } from "@/src/features/products/hooks/useProductRelations";
// import { useMemo } from "react";
// import { ProductConfig, MainFieldConfig, veriantConfig, CustomVariantConfig, CustomVariantMainConfig } from "@/src/features/products/constants/config";
// import { handleSave } from "../utils/handleSave";
// import { RenderFields } from "@/src/shared/components/field/RenderFields";
// import { Loading } from '@/src/shared/components/ui/loding';
// import { Dialog } from "./Dialog";
// import { useEffect } from "react";
// import { Input } from "@/src/shared/components/shadcn/ui/input";

// export const ProductForm = ({ alias, id }: { alias: string, id?: string }) => {
//     const defaultValues = {
//         name: "",
//         type: "",
//         variant_type: "basic",
//         variant_count: 1,
//         is_active: true,
//         // brand: "",
//         // model: "",
//     };
//     const form = useApiForm({ alias: alias || "products_products_create", defaultValues });
//     const store = useProductFormStore();
//     const { isLoading } = useProductRelations();
//     const [productType, brand, model, variant_count, variant_type] = form.watch(["type", "brand", "model", "variant_count", "variant_type"]);
//     const isComplete = useMemo(
//         () => [productType, brand, model].every(
//             (v) => v !== null && v !== undefined && v !== ""
//         ),
//         [productType, brand, model]
//     );


//     const filteredConfig = ProductConfig.filter(item => {
//         return item.role === "all" || item.role === productType;
//     });

//     const submitText = id ? "Update" : "Save";

//     useEffect(() => {
//         store.setVariantCount(Number(variant_count) || 0);
//     }, [variant_count]);



//     if (isLoading) return <Loading />;
//     return (
//         <>
//             <Form {...form}>
//                 <form onSubmit={(e) => e.preventDefault()} className="space-y-6 p-4 border rounded-lg max-w-xxl mx-auto">
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                         <RenderFields fields={MainFieldConfig} form={form} variantNumber={undefined} />
//                         {productType && <RenderFields fields={filteredConfig} form={form} selectedType={productType} variantNumber={undefined} />}
//                     </div>

//                     <VeriantRender variant_type={variant_type} form={form} productType={productType} />

//                     <RenderButton  variant_type={variant_type} store={ store } form={form} submitText={submitText} isComplete={isComplete} />
//                 </form>
//             </Form>
//             <Dialog setValue={form.setValue} />
//         </>
//     );
// };


// export const VeriantRender = ({variant_type,form,productType}: {variant_type: string,form: any,productType: string}) => {
//     const store = useProductFormStore();
//     return (
//         <div>
//             {store.isVariant &&
//                 Array.from({ length: store.variantCount }).map((_, i) => (
//                     // className="grid grid-cols-1 md:grid-cols-2 gap-4"
//                     <div key={i}  >
//                         <h2
//                             className='font-bold border-b-2 border-gray-200 mb-1 p-1 cursor-pointer'
//                             onClick={() => store.toggleVariant(i)}
//                         >
//                             Variant {i + 1}
//                         </h2>
//                         {store.openVariantIndex === i && (


//                             variant_type && variant_type !== "custom" && (
//                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                                     <RenderFields
//                                         fields={veriantConfig(variant_type)}
//                                         form={form}
//                                         selectedType={productType}
//                                         variantNumber={i}
//                                     />
//                                 </div>)
//                         )}

//                         {variant_type && variant_type === "custom" && (
//                             <div className="grid grid-cols-1  gap-4">

//                                 <Input
//                                     placeholder="Variant count"
//                                     value={form.getValues(`variants.${i}.variant_count`) || ""}
//                                     onChange={(e) => {
//                                         const val = Number(e.target.value) || 0;
//                                         form.setValue(`variants.${i}.variant_count`, val);
//                                         store.setAttributeCount(val);
//                                         store.setIsAttribute(true);
//                                     }}

//                                 />
//                             </div>
//                         )}

//                         {store.isAttribute && (
//                             <div className="grid grid-cols-1  gap-4">

//                                 <RenderFields
//                                     fields={[CustomVariantMainConfig[1], ...veriantConfig(variant_type)]}
//                                     form={form}
//                                     selectedType={productType}
//                                     variantNumber={i}
//                                 />

//                                 {Array.from({ length: store.attributeCount }).map((_, attrIndex) => (
//                                     <>
//                                         <p>Custom Attribute {attrIndex + 1}</p>
//                                         <RenderFields
//                                             fields={CustomVariantConfig}
//                                             form={form}
//                                             selectedType={productType}
//                                             variantNumber={i}
//                                         />
//                                     </>
//                                 ))}


//                             </div>
//                         )}
//                     </div>
//                 ))}
//         </div>
//     )
// }


// export const RenderButton=({form ,store,variant_type,submitText,isComplete}: {form : any,store : any,variant_type : string,submitText : string,isComplete : boolean})=>{
                
//     const toggleVariantOptions = () => {
//                     store.setIsVariant(!store.isVariant);
//                     if (!store.isVariant) {
//                         store.setOpenVariantIndex(0);
//                     }
//                 };
    
//     return (
//         <div className="flex gap-3 pt-4 ">
//             {store.isVariant && (
//                 <Button
//                     type="button"
//                     onClick={() => handleSave(form, store.variants, veriantConfig(variant_type))}
//                     disabled={form.isSubmitting}
//                     className={`bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium transition-colors ${form.isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
//                 >
//                     {form.isSubmitting ? 'Saving...' : submitText}
//                 </Button>
//             )}

//             <Button
//                 type="button"
//                 onClick={() => toggleVariantOptions()}
//                 disabled={!isComplete}
//                 className={`px-6 py-2 rounded-md font-medium transition-colors ${!isComplete
//                     ? "bg-gray-400 cursor-not-allowed"
//                     : "bg-blue-600 hover:bg-blue-700 text-white"
//                     }`}
//             >
//                 {store.isVariant ? "Back" : "Next"}
//             </Button>
//         </div>
//     );
// }
"use client";
import { useEffect, useMemo } from "react";
import { Form } from "@/src/shared/components/shadcn/ui/form";
import { Button } from "@/src/shared/components/shadcn/ui/button";
import { Input } from "@/src/shared/components/shadcn/ui/input";
import { useApiForm } from "@/src/shared/hooks/useApiForm";
import { useProductFormStore } from "@/src/features/products/store/useProductFormStore";
import { useProductRelations } from "@/src/features/products/hooks/useProductRelations";
import {
  ProductConfig,
  MainFieldConfig,
  veriantConfig,
  CustomVariantConfig,
  CustomVariantMainConfig,
} from "@/src/features/products/constants/config";
import { handleSave } from "../utils/handleSave";
import { RenderFields } from "@/src/shared/components/field/RenderFields";
import { Loading } from "@/src/shared/components/ui/loding";
import { Dialog } from "./Dialog";

// ✅ المكون الرئيسي
export const ProductForm = ({ alias, id }: { alias: string; id?: string }) => {
  const defaultValues = {
    name: "",
    type: "",
    variant_type: "",
    variant_count: 0,
    is_active: true,
  };

  const form = useApiForm({
    alias: alias || "products_products_create",
    defaultValues,
  });

  const store = useProductFormStore();
  const { isLoading } = useProductRelations();

  const [productType, brand, model, variant_count, variant_type] = form.watch([
    "type",
    "brand",
    "model",
    "variant_count",
    "variant_type",
  ]);

  const isMainComplete =useMemo(
    () => [productType, variant_count, variant_type].every((v) => v !== null && v !== undefined && v !== "" && v!==0),
    [productType, variant_count, variant_type]
  );
  const isComplete = useMemo(
    () => [productType, brand, model].every((v) => v !== null && v !== undefined && v !== "" ),
    [productType, brand, model]
  );

  // ✅ فلترة الحقول حسب نوع المنتج مع useMemo لتجنب إعادة التنفيذ
  const filteredConfig = useMemo(() => {
    return ProductConfig.filter((item) => item.role === "all" || item.role === productType);
  }, [productType]);

  const submitText = id ? "Update" : "Save";

  // ✅ تجنب الحلقة اللا نهائية
  useEffect(() => {
    const newCount = Number(variant_count) || 0;
    if (store.variantCount !== newCount) {
      store.setVariantCount(newCount);
    }
  }, [variant_count]);

  if (isLoading) return <Loading />;

  return (
    <>
      <Form {...form}>
        <form
          onSubmit={(e) => e.preventDefault()}
          className="space-y-6 p-4 border rounded-lg max-w-xxl mx-auto"
        >
          <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
            <RenderFields fields={MainFieldConfig.filter(f => f.name === "type")} form={form} />

            {productType && (
            <>
            <RenderFields fields={MainFieldConfig.filter(f => f.name === "variant_type")} form={form}  selectedType={productType} />
            <RenderFields fields={MainFieldConfig.filter(f => f.name === "variant_count")} form={form}  selectedType={productType} />
            </>
            )}

            {variant_type === "custom" && (
            <RenderFields fields={MainFieldConfig.filter(f => f.name === "attribute_count")} form={form} />
            )}

            
            {variant_type === "custom" ? (
            isMainComplete && store.isAttribute && (
                <RenderFields
                fields={filteredConfig}
                form={form}
                selectedType={productType}
                />
            )
            ) : (
            isMainComplete && (
                <RenderFields
                fields={filteredConfig}
                form={form}
                selectedType={productType}
                />
            )
            )}

          </div>

          <VariantRender variant_type={variant_type} form={form} productType={productType} />

          <RenderButton
            variant_type={variant_type}
            store={store}
            form={form}
            submitText={submitText}
            isComplete={isComplete}
            isMainComplete={isMainComplete}
          />
        </form>
      </Form>
      <Dialog setValue={form.setValue} />
    </>
  );
};

// // ✅ مكون عرض الـ Variants
// export const VariantRender = ({
//   variant_type,
//   form,
//   productType,
// }: {
//   variant_type: string;
//   form: any;
//   productType: string;
// }) => {
//   const store = useProductFormStore();

//   const variantConfigMemo = useMemo(() => veriantConfig(variant_type), [variant_type]);

//   return (
//     <div>
//       {store.isVariant &&
//         Array.from({ length: store.variantCount }).map((_, i) => (
//           <div key={i}>
//             <h2
//               className="font-bold border-b-2 border-gray-200 mb-1 p-1 cursor-pointer"
//               onClick={() => store.toggleVariant(i)}
//             >
//               Variant {i + 1}
//             </h2>

//             {store.openVariantIndex === i && variant_type !== "custom" && (
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <RenderFields
//                   fields={variantConfigMemo}
//                   form={form}
//                   selectedType={productType}
//                   variantNumber={i}
//                 />
//               </div>
//             )}

//             {variant_type === "custom" && (
//               <div className="grid grid-cols-1 gap-4">
//                 <Input
//                   placeholder="Variant count"
//                   value={form.getValues(`variants.${i}.variant_count`) || ""}
//                   type="number"
//                   onChange={(e) => {
//                     const val = Number(e.target.value) || 0;
//                     form.setValue(`variants.${i}.variant_count`, val);
//                     store.setAttributeCount(val);
//                     store.setIsAttribute(true);
//                   }}
//                 />
//               </div>
//             )}

//             {store.isAttribute && (
//               <div className="grid grid-cols-1 gap-4">
//                 <RenderFields
//                   fields={[CustomVariantMainConfig[1], ...variantConfigMemo]}
//                   form={form}
//                   selectedType={productType}
//                   variantNumber={i}
//                 />

//                 {Array.from({ length: store.attributeCount }).map((_, attrIndex) => (
//                   <div key={attrIndex}>
//                     <p>Custom Attribute {attrIndex + 1}</p>
//                     <RenderFields
//                       fields={CustomVariantConfig}
//                       form={form}
//                       selectedType={productType}
//                       variantNumber={i}
//                     />
//                   </div>
//                 ))}
//               </div>
//             )}
//           </div>
//         ))}
//     </div>
//   );
// };

// ✅ أزرار الحفظ والتنقل
export const RenderButton = ({
  form,
  store,
  variant_type,
  submitText,
  isComplete,
  isMainComplete,
}: {
  form: any;
  store: any;
  variant_type: string;
  submitText: string;
  isComplete: boolean;
  isMainComplete: boolean;
}) => {

  const toggleVariantOptions = () => {
    store.setIsVariant(!store.isVariant);
    if (!store.isVariant) {
      store.setOpenVariantIndex(0);
    }
  };

  return (
    <div className="flex gap-3 pt-4">
      {store.isVariant &&(
        <Button
          type="button"
          onClick={() => handleSave(form, store.variants, veriantConfig(variant_type))}
          disabled={form.isSubmitting}
          className={`bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium transition-colors ${
            form.isSubmitting ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {form.isSubmitting ? "Saving..." : submitText}
        </Button>
      )}
    { isMainComplete && (
      <Button
        type="button"
        onClick={() => toggleVariantOptions()}
        disabled={!isComplete}
        className={`px-6 py-2 rounded-md font-medium transition-colors ${
          !isComplete
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-blue-600 hover:bg-blue-700 text-white"
        }`}
      >
        {store.isVariant ? "Back" : "Next"}
      </Button>)}
    </div>
  );
};


import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/src/shared/components/shadcn/ui/accordion";


export const VariantRender = ({
  variant_type,
  form,
  productType,
}: {
  variant_type: string;
  form: any;
  productType: string;
}) => {
  const store = useProductFormStore();
  const variantConfigMemo = useMemo(() => veriantConfig(variant_type), [variant_type]);

  return (
    <Accordion
    type="single"
    collapsible
    className="w-full"
    value={
        store.openVariantIndex !== null
        ? `variant-${store.openVariantIndex}`
        : undefined
    }
    onValueChange={(val) => {
        const idx = val ? Number(val.replace("variant-", "")) : null;
        store.setOpenVariantIndex(idx);
    }}
    >
    {Array.from({ length: store.variantCount }).map((_, i) => (
        <AccordionItem key={i} value={`variant-${i}`} className="border rounded mb-2">
        <AccordionTrigger className="flex justify-between p-2 font-bold border-b cursor-pointer">
            Variant {i + 1}
        </AccordionTrigger>
        <AccordionContent className="p-2">
            {variant_type !== "custom" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <RenderFields
                fields={variantConfigMemo}
                form={form}
                selectedType={productType}
                variantNumber={i}
                />
            </div>
            )}

            {store.isAttribute && (
            <div className="grid grid-cols-1 gap-4">
                <RenderFields
                fields={[CustomVariantMainConfig[1], ...variantConfigMemo]}
                form={form}
                selectedType={productType}
                variantNumber={i}
                />
                {Array.from({ length: store.attributeCount }).map((_, attrIndex) => (
                <div key={attrIndex}>
                    <p>Custom Attribute {attrIndex + 1}</p>
                    <RenderFields
                    fields={CustomVariantConfig}
                    form={form}
                    selectedType={productType}
                    variantNumber={i}
                    attributeCount={attrIndex}

                    />
                </div>
                ))}
            </div>
            )}
        </AccordionContent>
        </AccordionItem>
    ))}
    </Accordion>

  );
};
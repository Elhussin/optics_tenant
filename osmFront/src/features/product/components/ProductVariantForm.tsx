import React, { useMemo } from "react";
import { useProductFormStore } from "../store/useProductFormStore";
import { ProductVariantConfig, ProductConfig,TypeEnum } from "../constants/";
import { buildPayload } from "../utils/buildPayload";
import { RenderForm } from "./RenderForm";
import { useApiForm } from "@/src/shared/hooks/useApiForm";
import { SelcetField } from "./SelcetField";
import { useProductRelations } from "../hooks/useProductRelations";
import { Loading } from '@/src/shared/components/ui/loding';
export default function ProductVariantForm({ onSubmit, className,formData,submitText }:any) {
  const {isVariant,setIsVariant,variantCount, variants, setVariantCount, setVariantField,openVariantIndex ,toggleVariant} = useProductFormStore();
  const { data, isLoading } = useProductRelations();
  const { register, handleSubmit, setValue, getValues, submitForm, errors, isSubmitting, reset, control, watch } = useApiForm({ alias: "products_products_create" });
  const [productType, brand_id, model] = watch(["type", "brand_id", "model"]);

//   const isIncomplete = type && brand_id && model;
  const isIncomplete = useMemo(
    () => [productType, brand_id, model].some((v) => !v),
    [productType, brand_id, model]
  );

  const filteredConfig = ProductConfig.filter(item => {
    return item.role === "all" || item.role === productType;
  });


  const toggleVariantOptions = () => {
    setIsVariant(!isVariant);
  };

//   const toggleVariantOptions = (index: number) => {
//     setOpenVariantIndex(prev => (prev === index ? null : index));
//   };
  if (isLoading) return <Loading />;

  
  // ⛏️ إنشاء payload النهائي عند الحفظ
//   const handleSave = () => {
//     const variantsPayload = buildPayload({ProductVariantConfig, { variants }, {
//       multiple: true,
//       include: ["product_id"],
//       prefix: "variants",
//     }});

//     onSubmit?.(variantsPayload);
//   };

  return (
    <>
    <div className={`${className}`}>
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
   
    {/* type */}
        <div className="mb-4 grid grid-cols-2 gap-4">
          <div>
            <label>Type <span className="text-red-500">*</span></label>
            <SelcetField
              fieldName={"type"}
              options={TypeEnum}
              required={true}
              control={control}
            />
          </div>
          <div>
            <label>Variant Count <span className="text-red-500">*</span></label>
            <input className="input-text" min={1} max={10} type="number" value={variantCount} onChange={(e) => setVariantCount(Number(e.target.value),)} />
          </div>
          {productType && (
          <RenderForm
            filteredConfig={filteredConfig}
            control={control}
            register={register}
            errors={errors}
            setValue={setValue}
            watch={watch}
            data={data}
            selectedType={productType}
          />
        )}

        {isVariant &&
          Array.from({ length: variantCount }).map((_, i) => (
            <div key={i}>
            <h2
              className='font-bold border-b-2 border-gray-200 mb-1 p-1 cursor-pointer'
              onClick={() => toggleVariant(i)}
            >
              Variant {i + 1}
            </h2>
            {openVariantIndex === i && (
              <RenderForm
                key={i}
                filteredConfig={ProductVariantConfig}
                control={control}
                register={register}
                errors={errors}
                setValue={setValue}
                watch={watch}
                data={data}
                selectedType={productType}
              />
            )}
            </div>
          ))
        }
      <div className="flex gap-3 pt-4">
          {isVariant && (

            <button
              type="submit"
              disabled={isSubmitting}
              className={`bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium transition-colors ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
            // disabled={mode === 'edit' && fieldName === 'email'||mode === 'edit' && fieldName === 'username'||mode === 'edit' && fieldName === 'password'}

            >
              {isSubmitting ? 'Saving...' : submitText}
            </button>

          )}
          <button
            type="button"
            onClick={() => toggleVariantOptions()}
            disabled={isIncomplete}
            className={`px-6 py-2 rounded-md font-medium transition-colors ${isIncomplete
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 text-white"
              }`}
          >
            {isVariant ? "Back" : "Next"}
          </button>



        </div>

        </div>
    </form>
    </div>


    </>
  );
}

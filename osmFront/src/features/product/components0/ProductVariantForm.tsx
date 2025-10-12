import React, { useMemo } from "react";
import { useProductFormStore } from "../store/useProductFormStore";
import { ProductVariantConfig, ProductConfig, TypeEnum } from "../constants";
import { buildPayload } from "../utils/buildPayload";
import { RenderForm } from "./RenderForm";
import { useApiForm } from "@/src/shared/hooks/useApiForm";
import { SelcetField } from "./SelectField";
import { useProductRelations } from "../hooks/useProductRelations";
import { Loading } from '@/src/shared/components/ui/loding';
import DynamicFormDialog from "@/src/shared/components/ui/dialogs/DynamicFormDialog";
import { Dialog } from "./Dialog";
import { safeToast } from "@/src/shared/utils/toastService";
export default function ProductVariantForm({className, submitText, id }: any) {
  const { isVariant, setIsVariant, variantCount, variants, setVariantCount, setVariantField, openVariantIndex, toggleVariant, isShowModal, entityName, setShowModal, currentFieldName } = useProductFormStore();
  const { data, isLoading } = useProductRelations();
  const { register, handleSubmit, setValue, getValues, submitForm, errors, isSubmitting, reset, control, watch } = useApiForm({ alias: "products_products_create" });
  const updateProductVariant = useApiForm({ alias: "products_product-variants_update" });
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

  if (isLoading) return <Loading />;


  // ⛏️ إنشاء payload النهائي عند الحفظ
    const handleSave = () => {
      const variantsPayload = buildPayload({config: ProductVariantConfig, formData: variants, options: { multiple: true, include: ["product_id"], prefix: "variants" }});
      console.log(variantsPayload);
      onSubmit?.(variantsPayload);
    };


      const onSubmit = async (data: any) => {
        console.log("first", data);
        try {
          let result;
          if (id) {
            result = await updateProductVariant.mutation.mutateAsync(data);
          } else {
            result = await submitForm(data);  // ✅ مهم إرسال FinalData وليس data
          }
    
          console.log(result);
    
          if (result?.success) {
            // reset();
            safeToast("Saved successfully", { type: "success" });
            reset(result.data);
          }
        } catch (err: any) {
          console.log(err);
          safeToast(err.message || "Server error", { type: "error" });
        }
      };

  return (
    <div className={`${className}`}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">



        <div className="mb-4 grid grid-cols-2 gap-4">
          {/* type  & variant count*/}
          <div>
            <label>Type <span className="text-red-500">*</span></label>
            <SelcetField
              item={{"name":"type","role":"all","filter":"Type","entityName":"products","fieldName":"type","type":"select","required":true}}
              parsedOptions={TypeEnum}
              control={control}
              setVariantField={setVariantField}
              openVariantIndex={openVariantIndex}
            />
          </div>

          <div>
            <label>Variant Count <span className="text-red-500">*</span></label>
            <input className="input-text" min={1} max={10} type="number" value={variantCount} onChange={(e) => setVariantCount(Number(e.target.value),)} />
          </div>
          {/* Product */}
          <div className="col-span-2">
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
      
        {/* Product Variant */}
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
        </div>
        {/* Button */}
        <div className="flex gap-3 pt-4">
          {isVariant && (

            <button
              type="button"
              onClick={handleSave}
              disabled={isSubmitting}
              className={`bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium transition-colors ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
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
      </form >
      <Dialog setValue={setValue} />
    </div>
  );
}

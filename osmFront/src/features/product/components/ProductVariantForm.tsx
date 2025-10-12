// ProductVariantForm.tsx
import React, { useMemo } from "react";
import { useProductFormStore } from "../store/useProductFormStore";
import { ProductVariantConfig, ProductConfig, TypeEnum } from "../constants/";
import { buildPayload } from "../utils/buildPayload";
import { RenderForm } from "./RenderForm";
import { useApiForm } from "@/src/shared/hooks/useApiForm";
import { SelcetField } from "./SelcetField";
import { useProductRelations } from "../hooks/useProductRelations";
import { Loading } from '@/src/shared/components/ui/loding';
import { Dialog } from "./Dialog";
import { safeToast } from "@/src/shared/utils/toastService";

export default function ProductVariantForm({ className, submitText = "Save", id }: any) {
  const {
    isVariant,
    setIsVariant,
    variantCount,
    variants,
    setVariantCount,
    setVariantField,
    openVariantIndex,
    toggleVariant,
    setOpenVariantIndex,
  } = useProductFormStore();

  const { data, isLoading } = useProductRelations();
  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    submitForm,
    errors,
    isSubmitting,
    reset,
    control,
    watch,
  } = useApiForm({ alias: "products_products_create" });

  const updateProductVariant = useApiForm({ alias: "products_product-variants_update" });

  const [productType, brand_id, model] = watch(["type", "brand_id", "model"]);

  const isIncomplete = useMemo(
    () => [productType, brand_id, model].some((v) => v === null || v === undefined || v === ""),
    [productType, brand_id, model]
  );

  const filteredConfig = ProductConfig.filter(item => {
    return item.role === "all" || item.role === productType;
  });

  const toggleVariantOptions = () => {
    setIsVariant(!isVariant);
    if (!isVariant) {
      // opening variant step: ensure first variant is open
      setOpenVariantIndex(0);
    }
  };

  if (isLoading) return <Loading />;

  // Build and submit: get form values from useForm + variants from store
  const handleSave = () => {

    // use handleSubmit to validate and get values from react-hook-form
    handleSubmit((formValues: any) => {
      // build variants payload from zustand variants array
      const variantsPayload = buildPayload({
        config: ProductVariantConfig,
        formData: variants,
        options: { multiple: true, include: ["product_id"], prefix: "variants" },
      });
  
      console.log("formValues", formValues);
      console.log("handleSave", variantsPayload);
      const finalPayload = {
        ...formValues,
        variants: variantsPayload,
      };
      console.log("handleSave", finalPayload);
      onSubmit(finalPayload);
    })();
  };

  const onSubmit = async (data: any) => {
    try {
      let result;
      if (id) {
        result = await updateProductVariant.mutation.mutateAsync(data);
      } else {
        result = await submitForm(data); // send final payload to API helper
      }

      if (result?.success) {
        safeToast("Saved successfully", { type: "success" });
        reset(result.data);
      }
    } catch (err: any) {
      safeToast(err?.message || "Server error", { type: "error" });
    }
  };

  return (
    <div className="mb-4 grid grid-cols-1 justify-center items-center gap-4">
      <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
        <div className="">
          <div>
            <label>Type <span className="text-red-500">*</span></label>
            <SelcetField
              item={{ name: "type", role: "all", filter: "Type", entityName: "products", fieldName: "type", type: "select", required: true }}
              parsedOptions={TypeEnum}
              control={control}
              setVariantField={setVariantField}
              openVariantIndex={openVariantIndex}
            />
          </div>

          <div>
            <label>Variant Count <span className="text-red-500">*</span></label>
            <input
              className="input-text"
              min={1}
              max={10}
              type="number"
              value={variantCount}
              onChange={(e) => setVariantCount(Number(e.target.value))}
            />
          </div>

          <div className="">
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
                variantNumber={undefined} // product-level
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
                      filteredConfig={ProductVariantConfig}
                      control={control}
                      register={register}
                      errors={errors}
                      setValue={setValue}
                      watch={watch}
                      data={data}
                      selectedType={productType}
                      variantNumber={i} // IMPORTANT: pass index so fields register as variants[i].*
                    />
                  )}
                </div>
              ))}
          </div>

          <div className="flex gap-3 pt-4 ">
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
      </form>

      <Dialog setValue={setValue} />
    </div>
  );
}

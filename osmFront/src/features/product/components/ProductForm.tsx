import React, { useEffect } from 'react';
import { useApiForm } from '@/src/shared/hooks/useApiForm';
import { safeToast } from "@/src/shared/utils/toastService";
import { Loading } from '@/src/shared/components/ui/loding';
import { ForeignKeyField } from "./ForeignKeyField";
import { parsedOptions } from "@/src/features/product/utils/parsedOptions"
import { selectRelatedData } from "@/src/features/product/utils/selectRelatedData"
import { z } from "zod";
import DynamicFormDialog from "@/src/shared/components/ui/dialogs/DynamicFormDialog";
import { relationshipConfigs } from '@/src/features/formGenerator/constants/generatFormConfig';
import { ProductForginKeyConfig, TEXTFIELDDATA, checkBoxConfig } from '@/src/features/product/constants';
import { CheckboxField } from "./CheckboxField";
import { ReturnTextField } from "./TextField";
import { useProductRelations } from '@/src/features/product/hooks/useProductRelations';
import { SelcetField } from "./SelcetField";
import { generateLensOptions } from "@/src/features/product/utils/generateLensOptions";
export default function ProductVariantForm({ alias, title, message, submitText, id, isView = false, className = "", }: any) {
  const [showModal, setShowModal] = React.useState(false);
  const [entity, setEntity] = React.useState<string>("");
  const [attributes, setAttributes] = React.useState<any[]>([]);
  const [currentFieldName, setCurrentFieldName] = React.useState('');

  const updateProductVariant = useApiForm({ alias: "products_product-variants_update" });
  const { register, handleSubmit, setValue, getValues, submitForm, errors, isSubmitting, reset, control, watch } = useApiForm({ alias: "products_products_create" });
  const { data, isLoading } = useProductRelations();
  const relationConfig = relationshipConfigs[currentFieldName];

  const selectedType = watch("type"); // ترقب قيمة الـ Select
  const filteredConfig = ProductForginKeyConfig.filter(item => {
    return item.role === "all" || item.role === selectedType;
  });



  const onSubmit = async (data: any) => {
    console.log("first",data);
    const productPayload = {
      name: data.name,
      type: data.type,
      category_id: data.category_id,
      supplier_id: data.supplier_id,
      manufacturer_id: data.manufacturer_id,
      brand_id: data.brand_id,
      sku: data.sku,
      model:data.model,
      // ... أي حقول أخرى
    };
  
    const variantPayload = {
      lens_color_id: data.lens_color_id,
      lens_material_id: data.lens_material_id,
      lens_diameter_id: data.lens_diameter_id,
      lens_base_curve_id: data.lens_base_curve_id,
      lens_water_content_id: data.lens_water_content_id,
      replacement_schedule_id: data.replacement_schedule_id,
      warranty_id: data.warranty_id,
      selling_price:data.selling_price,
      // ... باقي الحقول الخاصة بالـ variant
    };
  
    const FinalData = { ...productPayload, variants: [variantPayload] };
    console.log("Sending payload:", FinalData);
  
    try {
      let result;
      if (id) {
        result = await updateProductVariant.mutation.mutateAsync(FinalData);
      } else {
        result = await submitForm(FinalData);  // ✅ مهم إرسال FinalData وليس data
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
  

  if (isLoading) return <Loading />;

  const TypeEnum = [{ value: "CL", label: "Contact Lens" }, { value: "SL", label: "Spectacle Lens" }, { value: "FR", label: "Frames" }, { value: "AX", label: "Accessories" }, { value: "DV", label: "Devices" }, { value: "OT", label: "Other" }]
  const select = [
    { "label": "SPH", "name": "spherical", "type": "select", options: generateLensOptions(-60, 60) },
    { "label": "CYL", "name": "cylinder", "type": "select", options: generateLensOptions(-12, 12) },
    { "label": "AXIS", "name": "axis", "type": "select", options: generateLensOptions(0, 180, 1, false) },
    { "label": "ADD", "name": "addition", "type": "select", options: generateLensOptions(1, 6) },
  ]


  return (
    <div className={`${className}`}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* type */}
        <div className="mb-4">
        <SelcetField
          fieldName={"type"}
          label={"Type"}
          options={TypeEnum}
          required={true}
          control={control}
        />
        </div>

        {/* forign key */}
        <div className="grid  grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
          {filteredConfig.map((item: any, index: number) => (
            <ForeignKeyField
              key={index}
              name={item.name}
              filter={item.filter}
              hent={item.hent}
              data={parsedOptions(selectRelatedData(data, item.filter), item.filter, item.mapOnly, item.fieldName)}
              control={control}
              setShowModal={setShowModal}
              setEntity={setEntity}
              entityName={item.entityName}
              setCurrentFieldName={setCurrentFieldName}
            />
          ))}
        </div>

        {/* text field */}
        <div className="grid  grid-cols-1 md:grid-cols-2 gap-2">
        <ReturnTextField
          data={TEXTFIELDDATA}
          register={register}
          errors={errors}

        />
        </div>

        {/* lens */}
        {selectedType && (selectedType === "CL" || selectedType === "SL") && (
          <div className="flex flex-wrap items-center gap-2">
            {select.map((item: any, index: number) => (
              <SelcetField
                key={index}
                fieldName={item.name}
                label={item.label}
                options={item.options}
                required={item.required}
                control={control}
                placeholder={item.name === "axis" ? "0" : "+00.00"}
              />
            ))}
          </div>


        )}

        {/* lens Coting */}
        {selectedType && (selectedType === "SL") && (
          <>
            {checkBoxConfig.map((item: any, index: number) => (
              <CheckboxField
                key={index}
                data={data.attributes.filter((v: any) => v.attribute_name === item.filter)}
                register={register}
                errors={errors}
                watch={watch}
                setValue={setValue}
                name={item.name}
                label={item.filter}
                entityName={item.entityName}
                setShowModal={setShowModal}
                setCurrentFieldName={setCurrentFieldName}
                setEntity={setEntity}
              />
            ))}

          </>
        )}



        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium transition-colors ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
          // disabled={mode === 'edit' && fieldName === 'email'||mode === 'edit' && fieldName === 'username'||mode === 'edit' && fieldName === 'password'}

          >
            {isSubmitting ? 'Saving...' : submitText}
          </button>
        </div>
      </form>

      {showModal && (
        <DynamicFormDialog
          entity={entity}
          onClose={(data: any) => {
            setShowModal(false);
            if (data) {
              // fetchAttributes.refetch();
              setAttributes((prev) => [data, ...prev]);
              // هنا نستخدم الاسم الصحيح للحقل الذي تم اختياره
              setValue(currentFieldName, String(data.id));
            }


          }}
          title="Add Attribute Value"
        />
      )}

    </div>
  );
}


{/* 
      {showModal && (
        <DynamicFormDialog
          entity={entity}
          onClose={(newItem: any) => {
            setShowModal(false);

            if (newItem) {
              // نحدث قائمة البيانات فقط الخاصة بالكيان الحالي
              setData((prev) => ({
                ...prev,
                [entity]: [newItem, ...prev[entity]],
              }));

              // نعين القيمة الجديدة داخل الفورم
              setValue(currentFieldName, String(newItem.id));
            }
          }}
          title={`Add ${entity}`}
        />
      )} */}

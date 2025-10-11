import React, { useEffect } from 'react';
import { useApiForm } from '@/src/shared/hooks/useApiForm';
import { safeToast } from "@/src/shared/utils/toastService";
import { Loading } from '@/src/shared/components/ui/loding';
import DynamicFormDialog from "@/src/shared/components/ui/dialogs/DynamicFormDialog";
import { ProductForginKeyConfig, ProductConfig } from '@/src/features/product/constants';
import { useProductRelations } from '@/src/features/product/hooks/useProductRelations';
import { RenderForm } from './Form';
import { SelcetField } from "./SelcetField";
export default function ProductVariantForm({ alias, title, message, submitText, id, isView = false, className = "", }: any) {
  const [showModal, setShowModal] = React.useState(false);
  const [entity, setEntity] = React.useState<string>("");
  const [attributes, setAttributes] = React.useState<any[]>([]);
  const [currentFieldName, setCurrentFieldName] = React.useState('');

  const updateProductVariant = useApiForm({ alias: "products_product-variants_update" });
  const { register, handleSubmit, setValue, getValues, submitForm, errors, isSubmitting, reset, control, watch } = useApiForm({ alias: "products_products_create" });
  const { data, isLoading } = useProductRelations();
  const [varientCount, setVarientCount] = React.useState(1);
  const [isProduct, setIsProduct] = React.useState(true);
  const [isVariant, setIsVariant] = React.useState(false);

  const wactProductType = watch(["type", "brand_id", "model"]);
  const isIncomplete = wactProductType.some((v) => !v); // يتحقق إن فيه قيمة فاضية
  const selectedType = watch("type");
  const selectedProductType = watch("product_type_id");

  const filteredConfig = ProductConfig.filter(item => {
    return item.role === "all" || item.role === selectedType;
  });



  console.log("selectedType", selectedType);
  console.log("wactProductType", wactProductType);

  const onSubmit = async (data: any) => {
    console.log("first", data);
    const productPayload = {
      name: data.name,
      type: data.type,
      category_id: data.category_id,
      supplier_id: data.supplier_id,
      manufacturer_id: data.manufacturer_id,
      brand_id: data.brand_id,
      model: data.model,
      description: data.description,
    };

    const variantPayload = {
      product_id: data.product_id || '',
      sku: data.sku,
      // usku: data.usku,
      frame_shape_id: data.frame_shape_id,
      frame_material_id: data.frame_material_id,
      frame_color_id: data.frame_color_id,
      temple_length_id: data.temple_length_id,
      bridge_width_id: data.bridge_width_id,

      lens_diameter_id: data.lens_diameter_id,
      lens_color_id: data.lens_color_id,
      lens_material_id: data.lens_material_id,
      lens_base_curve_id: data.lens_base_curve_id,
      lens_coatings_id: data.lens_coatings_id,

      lens_water_content_id: data.lens_water_content_id,
      replacement_schedule_id: data.replacement_schedule_id,
      expiration_date: data.expiration_date,

      product_type_id: data.product_type_id,
      spherical: data.spherical,
      cylinder: data.cylinder,
      axis: data.axis,
      addition: data.addition,
      unit_id: data.unit_id,

      warranty_id: data.warranty_id,
      weight_id: data.weight_id,
      dimensions_id: data.dimensions_id,


      last_purchase_price: data.last_purchase_price,
      selling_price: data.selling_price,
      discount_percentage: data.discount_percentage,
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

  const toggleVariant = () => {
    setIsVariant(!isVariant);
  };

  if (isLoading) return <Loading />;

  const TypeEnum = [{ value: "", label: "select..." }, { value: "CL", label: "Contact Lens" }, { value: "SL", label: "Spectacle Lens" }, { value: "FR", label: "Frames" }, { value: "AX", label: "Accessories" }, { value: "DV", label: "Devices" }, { value: "OT", label: "Other" }]


  return (
    <div className={`${className}`}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* type */}

        <div className="mb-4 grid grid-cols-2 gap-4">
          <div>
            <label>Type</label>
            <SelcetField
              fieldName={"type"}
              // label={"Type"}
              options={TypeEnum}
              required={true}
              control={control}
            />
          </div>
          <div>
            <label>Variant Count</label>
            <input className="input-text" type="number" value={varientCount} onChange={(e) => setVarientCount(Number(e.target.value),)} />
          </div>
        </div>
        {selectedType && isProduct && (
          <RenderForm
            filteredConfig={filteredConfig}
            control={control}
            register={register}
            errors={errors}
            setValue={setValue}
            watch={watch}
            data={data}
            submitForm={submitForm}
            selectedType={selectedType}
            isSubmitting={isSubmitting}
            setShowModal={setShowModal}
            setEntity={setEntity}
            setCurrentFieldName={setCurrentFieldName}
          />
        )}



        {isVariant &&
          Array.from({ length: varientCount }).map((_, i) => (
            <div key={i}>
              <h2>Variant {i + 1}</h2>
              <RenderForm
                key={i}
                filteredConfig={ProductForginKeyConfig}
                control={control}
                register={register}
                errors={errors}
                setValue={setValue}
                watch={watch}
                data={data}
                submitForm={submitForm}
                selectedType={selectedType}
                isSubmitting={isSubmitting}
                setShowModal={setShowModal}
                setEntity={setEntity}
                setCurrentFieldName={setCurrentFieldName}
              />
            </div>
          ))
        }
        <div className="flex gap-3 pt-4">
          {isVariant && isProduct && (

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
            onClick={() => toggleVariant()}
            disabled={isIncomplete}
            className={`px-6 py-2 rounded-md font-medium transition-colors ${isIncomplete
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 text-white"
              }`}
          >
            {isVariant ? "Back" : "Next"}
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


// <div className={`${className}`}>
// <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
// {/* type */}
// <div className="mb-4">
// <SelcetField
//   fieldName={"type"}
//   label={"Type"}
//   options={TypeEnum}
//   required={true}
//   control={control}
// />
// </div>

//   {/* forign key */}
//   <div className="grid  grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
//     {filteredConfig.map((item: any, index: number) => (
//       <ForeignKeyField
//         key={index}
//         name={item.name}
//         filter={item.filter}
//         hent={item.hent}
//         data={parsedOptions(selectRelatedData(data, item.filter), item.filter, item.mapOnly, item.fieldName)}
//         control={control}
//         setShowModal={setShowModal}
//         setEntity={setEntity}
//         entityName={item.entityName}
//         setCurrentFieldName={setCurrentFieldName}
//       />
//     ))}
//   </div>

//   {/* text field */}
//   <div className="grid  grid-cols-1 md:grid-cols-2 gap-2">
//   <ReturnTextField
//     data={TEXTFIELDDATA}
//     register={register}
//     errors={errors}

//   />
//   </div>

//   {/* lens */}
//   {selectedType && (selectedType === "CL" || selectedType === "SL") && (
//     <div className="flex flex-wrap items-center gap-2">
//       {select.map((item: any, index: number) => (
//         <SelcetField
//           key={index}
//           fieldName={item.name}
//           label={item.label}
//           options={item.options}
//           required={item.required}
//           control={control}
//           placeholder={item.name === "axis" ? "0" : "+00.00"}
//         />
//       ))}
//     </div>


//   )}

//   {/* lens Coting */}
//   {selectedType && (selectedType === "SL") && (
//     <>
//       {checkBoxConfig.map((item: any, index: number) => (
//         <CheckboxField
//           key={index}
//           data={data.attributes.filter((v: any) => v.attribute_name === item.filter)}
//           register={register}
//           errors={errors}
//           watch={watch}
//           setValue={setValue}
//           name={item.name}
//           label={item.filter}
//           entityName={item.entityName}
//           setShowModal={setShowModal}
//           setCurrentFieldName={setCurrentFieldName}
//           setEntity={setEntity}
//         />
//       ))}

//     </>
//   )}



//   <div className="flex gap-3 pt-4">
//     <button
//       type="submit"
//       disabled={isSubmitting}
//       className={`bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium transition-colors ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
//     // disabled={mode === 'edit' && fieldName === 'email'||mode === 'edit' && fieldName === 'username'||mode === 'edit' && fieldName === 'password'}

//     >
//       {isSubmitting ? 'Saving...' : submitText}
//     </button>
//   </div>
// </form>

// {showModal && (
//   <DynamicFormDialog
//     entity={entity}
//     onClose={(data: any) => {
//       setShowModal(false);
//       if (data) {
//         // fetchAttributes.refetch();
//         setAttributes((prev) => [data, ...prev]);
//         // هنا نستخدم الاسم الصحيح للحقل الذي تم اختياره
//         setValue(currentFieldName, String(data.id));
//       }


//     }}
//     title="Add Attribute Value"
//   />
// )}

// </div>


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

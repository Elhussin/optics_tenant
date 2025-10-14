// RenderForm.tsx
import React from "react";
import { SelcetField } from "../../../shared/components/field/SelcetField";
import { CheckboxField } from "../../../shared/components/field/CheckboxField";
import { TextField } from "../../../shared/components/field/TextField";
import { parsedOptions } from "@/src/features/product/utils/parsedOptions"
import { selectRelatedData } from "@/src/features/product/utils/selectRelatedData"
import { useProductFormStore } from "@/src/features/product/store/useProductFormStore";
import { ActionButton } from "@/src/shared/components/ui/buttons";
import { CirclePlus } from "lucide-react";

interface RenderFormProps {
  filteredConfig: any[];
  selectedType: string;
  control: any;
  register: any;
  errors: any;
  setValue: any;
  watch: any;
  data?: any;
  variantNumber?: number | undefined;
}

const filterData = (
  data: any,
  item: any,
  selectedType: any,
  subField?: string,
  subFilter?: string
) => {
  const filterField = item.filter;
  const selectedData = selectRelatedData(data, filterField);
  let filteredData = selectedData;
  if (subField && subFilter && filterField === subField) {
    filteredData = selectedData?.filter(
      (v: any) => v[subFilter] === selectedType || v[subFilter] === "All"
    );
  }
  return parsedOptions(filteredData, item);
};


export const RenderForm = ({ filteredConfig, selectedType, control, register, errors, setValue, watch, variantNumber }: RenderFormProps) => {
  const { setShowModal, setEntityName, setCurrentFieldName, setVariantField, openVariantIndex ,data } = useProductFormStore();

  const handleClick = (entity: string, fieldName: string) => {
    setEntityName(entity);
    setCurrentFieldName(fieldName);
    setShowModal(true);
  };

  console.log("errors",errors)
  return (
    <div className="space-y-4">
      {filteredConfig.map((item: any, index: number) => {
        if (item.type === "select") {
          if (selectedType && (selectedType === item.role || item.role === "all")) {
            return (
              <div key={`select-${index}`} className="flex flex-1">
                <div className="flex flex-row">
                <label className="label" title={item.title} htmlFor={item.name}>{item.label}</label>
                <SelcetField
                  control={control}
                  parsedOptions={item.options}
                  item={item}
                  setVariantField={setVariantField}
                  openVariantIndex={openVariantIndex}
                  variantNumber={variantNumber}
                  errors={errors}
                />
               </div>
              </div>
            );
          }
          return null;
        } else if (item.type === "checkbox") {
          if (selectedType && (selectedType === item.role || item.role === "all")) {
            return (
              <div className="" key={`checkbox-wrap-${index}`}>
                <div className="col-span-4" key={`checkbox-${index}`}>
                  <div className="flex items-center">
                  <label className="label border-b-2 border-gray-300" title={item.title} htmlFor={item.name}>{item.label}</label>

                    {item.entityName &&     
                    <ActionButton
                    onClick={() => handleClick(item.entityName, item.name)}
                    variant="outline"
                    className="px-3 py-2 whitespace-nowrap"
                    icon={<CirclePlus size={18} color="green" />}
                    title={`Add ${item.filter}`}
                  />}
                </div>
                  <CheckboxField
                    key={index}
                    item={item}
                    data={data?.['attribute-values'].filter((v: any) => v.attribute_name === item.filter)}
                    register={register}
                    errors={errors}
                    watch={watch}
                    setValue={setValue}
                    variantNumber={variantNumber}
                  />
                </div>

              </div>
            );
          }
          return null;
        } else if (item.type === "foreignkey") {
          return (
            <div key={index}>
            <label className="label" title={item.title} htmlFor={item.name}>{item.label}</label>
    
            <div className={`flex items-center gap-2`} >
                <div className="flex-1">
              <SelcetField
                item={item}
                parsedOptions={ 
                  filterData(
                  useProductFormStore((state) => state.data),
                  item,
                  selectedType,
                  "brands",
                  "product_type"
                )}
                control={control}
                setVariantField={setVariantField}
                openVariantIndex={openVariantIndex}
                variantNumber={variantNumber}
                errors={errors}
              />
              </div>
              <div>
              <ActionButton
                onClick={() => handleClick(item.entityName, item.name)}
                variant="outline"
                className="px-3 py-2 whitespace-nowrap"
                icon={<CirclePlus size={18} color="green" />}
                title={`Add ${item.filter}`}
              />
              </div>
            </div>
            </div>
          );
        } else {
          // text field
          return (
            <div className="col-span-2" key={index}>
              <TextField
                item={item}
                register={register}
                errors={errors}
                variantNumber={variantNumber}
              />
            </div>
          );
        }
      })}
    </div>
  );
};

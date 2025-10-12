// RenderForm.tsx
import React from "react";
import { SelcetField } from "./SelcetField";
import { CheckboxField } from "./CheckboxField";
import { TextField } from "./TextField";
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
  data: any;
  variantNumber?: number | undefined;
}

export const RenderForm = ({ filteredConfig, selectedType, control, register, errors, setValue, watch, data, variantNumber }: RenderFormProps) => {
  const { setShowModal, setEntityName, setCurrentFieldName, setVariantField, openVariantIndex } = useProductFormStore();

  const handleClick = (entity: string, fieldName: string) => {
    setEntityName(entity);
    setCurrentFieldName(fieldName);
    setShowModal(true);
  };

  return (
    <div className="space-y-4">
      {filteredConfig.map((item: any, index: number) => {
        // corrected precedence: ensure selectedType exists
        if (!selectedType) {
          // if no selectedType (shouldn't happen here) skip
        }

        if (item.type === "select") {
          if (selectedType && (selectedType === item.role || item.role === "all")) {
            return (
              <div key={`select-${index}`} className="flex flex-wrap items-center gap-2">
                <label>{item.filter}</label>
                <SelcetField
                  control={control}
                  parsedOptions={item.options}
                  item={item}
                  setVariantField={setVariantField}
                  openVariantIndex={openVariantIndex}
                  variantNumber={variantNumber}
                />
              </div>
            );
          }
          return null;
        } else if (item.type === "checkbox") {
          if (selectedType && (selectedType === item.role || item.role === "all")) {
            return (
              <div className="flex items-start justify-between gap-2" key={`checkbox-wrap-${index}`}>
                <div className="col-span-4" key={`checkbox-${index}`}>
                  <label>{item.filter}</label>
                  <CheckboxField
                    key={index}
                    item={item}
                    data={data?.attributes?.filter((v: any) => v.attribute_name === item.filter) || []}
                    register={register}
                    errors={errors}
                    watch={watch}
                    setValue={setValue}
                    variantNumber={variantNumber}
                  />
                </div>
                <div className="flex items-center">
                  <ActionButton
                    onClick={() => handleClick(item.entityName, item.name)}
                    variant="outline"
                    className="px-3 py-2 whitespace-nowrap"
                    icon={<CirclePlus size={18} color="green" />}
                    title={`Add ${item.filter}`}
                  />
                </div>
              </div>
            );
          }
          return null;
        } else if (item.type === "foreignkey") {
          return (
            <>
                            <label>{item.filter}</label>
    
            <div className={`flex items-center gap-2`} key={index}>
                <div className="flex-1">
              <SelcetField
                key={index}
                item={item}
                parsedOptions={parsedOptions(selectRelatedData(data, item.filter), item.filter, item.mapOnly, item.fieldName)}
                control={control}
                setVariantField={setVariantField}
                openVariantIndex={openVariantIndex}
                variantNumber={variantNumber}
      
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
            </>
          );
        } else {
          // text field
          return (
            <div className="col-span-2" key={index}>
              <TextField
                key={index}
                data={item}
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

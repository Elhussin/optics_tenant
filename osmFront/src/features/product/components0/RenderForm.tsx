
interface RenderFormProps {
    filteredConfig: any[];
    selectedType: string;
    control: any;
    register: any;
    errors: any;
    setValue: any;
    watch: any;
    data: any;
    variantNumber?: any;
}
import { SelectField } from "./SelectField";
import { CheckboxField } from "./CheckboxField";
import { TextField } from "./TextField";
import { parsedOptions } from "@/src/features/product/utils/parsedOptions"
import { selectRelatedData } from "@/src/features/product/utils/selectRelatedData"
import { useProductFormStore } from "@/src/features/product/store/useProductFormStore";
import { ActionButton } from "@/src/shared/components/ui/buttons";
import { CirclePlus } from "lucide-react";

export const RenderForm = ({ filteredConfig, selectedType, control, register, errors, setValue, watch, data  }: RenderFormProps) => {
    const { setShowModal, setEntityName, setCurrentFieldName, setVariantField, openVariantIndex } = useProductFormStore();
    const handleClick = (entity: string, fieldName: string) => {
        setEntityName(entity);
        setCurrentFieldName(fieldName);
        setShowModal(true);
    
      };
   
    return (
        <div className="space-y-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredConfig.map((item: any, index: number) => {
                if (item.type === "select") {
                    if (selectedType && (selectedType === item.role || item.role === "all")) {
                        return (
                            <div key={`select-${index}`} className="flex flex-wrap items-center gap-2">
                                <SelectField
                                    control={control}
                                    parsedOptions={item.options}
                                    item={item}

                                    setVariantField={setVariantField}
                                    openVariantIndex={openVariantIndex !== null ? openVariantIndex : undefined}
                                />
                            </div>
                        );
                    }
                    return null;
                }
                else if (item.type === "checkbox") {
                    // if (selectedType && selectedType === item.role || item.role === "all") 
                        if (selectedType && (selectedType === item.role || item.role === "all"))
                        {
                        return (
                            <>
                            <div className="flex items-start justify-between gap-2">
                            <div key={`checkbox-${index}`} className="col-span-4">
                                <CheckboxField
                                    key={index}
                                    item={item}
                                    data={data.attributes.filter((v: any) => v.attribute_name === item.filter)}
                                    register={register}
                                    errors={errors}
                                    watch={watch}
                                    setValue={setValue}
                                    openVariantIndex={openVariantIndex !== null ? openVariantIndex : undefined}
                                    setVariantField={setVariantField}
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
                          </>
                        );
                    }
                    return null;
                }
                else if (item.type === "foreignkey") {
                    return (
                        <div className="" key={index}>
                            <SelectField
                                key={index}
                                item={item}
                                parsedOptions={parsedOptions(selectRelatedData(data, item.filter), item.filter, item.mapOnly, item.fieldName)}
                                control={control}
                                setVariantField={setVariantField}
                                openVariantIndex={openVariantIndex !== null ? openVariantIndex : undefined}
                            />
                            <ActionButton
                                onClick={() => handleClick(item.entityName, item.name)}
                                variant="outline"
                                className="px-3 py-2 whitespace-nowrap"
                                icon={<CirclePlus size={18} color="green" />}
                                title={`Add ${item.filter}`}
                            />
                        </div>
                    )
                }
                // text field
                else {
                    return (
                        <div className="col-span-2" key={index}>
                            <TextField
                                key={index}
                                data={item}
                                register={register}
                                errors={errors}
                            />
                        </div>

                    );
                }
            }
            )}
        </div>

    );
}
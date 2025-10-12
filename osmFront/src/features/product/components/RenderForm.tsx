
interface RenderFormProps {
    filteredConfig: any[];
    selectedType: string;
    control: any;
    register: any;
    errors: any;
    setValue: any;
    watch: any;
    data: any;
}
import { SelcetField } from "./SelcetField";
import { CheckboxField } from "./CheckboxField";
import { ForeignKeyField } from "./ForeignKeyField";
import { TextField } from "./TextField";
import { parsedOptions } from "@/src/features/product/utils/parsedOptions"
import { selectRelatedData } from "@/src/features/product/utils/selectRelatedData"
import { useProductFormStore } from "@/src/features/product/store/useProductFormStore";


export const RenderForm = ({ filteredConfig, selectedType, control, register, errors, setValue, watch, data  }: RenderFormProps) => {
    const { setShowModal, setEntityName, setCurrentFieldName, setVariantField, openVariantIndex, toggleVariant } = useProductFormStore();

   
    return (
        <div className="space-y-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredConfig.map((item: any, index: number) => {
                if (item.type === "select") {
                    if (selectedType && (selectedType === item.role || item.role === "all")) {
                        return (
                            <div key={`select-${index}`} className="flex flex-wrap items-center gap-2">
                                <SelcetField
                                    key={index}
                                    fieldName={item.name}
                                    label={item.label}
                                    options={item.options}
                                    required={item.required}
                                    control={control}
                                    placeholder={item.name === "axis" ? "0" : "+00.00"}
                                />
                            </div>
                        );
                    }
                    return null;
                }
                else if (item.type === "checkbox") {
                    if (selectedType && selectedType === item.role || item.role === "all") {
                        return (
                            <div key={`checkbox-${index}`} className="col-span-4">
                                <CheckboxField
                                    key={index}
                                    item={item}
                                    data={data.attributes.filter((v: any) => v.attribute_name === item.filter)}
                                    register={register}
                                    errors={errors}
                                    watch={watch}
                                    setValue={setValue}

                                />
                            </div>
                        );
                    }
                    return null;
                }
                else if (item.type === "foreignkey") {
                    return (
                        <div className="" key={index}>
                            <ForeignKeyField
                                key={index}
                                item={item}
                                data={parsedOptions(selectRelatedData(data, item.filter), item.filter, item.mapOnly, item.fieldName)}
                                control={control}
                                setShowModal={setShowModal}
                                // setEntity={setEntity}
                                // setCurrentFieldName={setCurrentFieldName}
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

import { FormField, FormItem, FormLabel, FormMessage, FormControl } from "@/src/shared/components/shadcn/ui/form";
import { TextField, CheckboxField, SwitchField, RadioField, SelectField, SearchableSelect, MultiSelectField, MultiCheckbox } from "./Fields";
import { filterData } from "../../../features/products/components/forms/variants/filterData";
import { useProductFormStore } from "@/src/features/products/store/useProductFormStore";
import { ActionButton } from "@/src/shared/components/ui/buttons";
import { CirclePlus } from "lucide-react";
import { RenderFormProps } from "@/src/features/products/types";
import { parsedOptions } from "@/src/features/products/utils/parsedOptions";

export const RenderFields = (props: RenderFormProps) => {
    const { fields, form, selectedType, variantNumber } = props;
    const { setShowModal, setEntityName, setCurrentFieldName, setVariantField, data } = useProductFormStore();

    const handleClick = (entity: string, fieldName: string) => {
        setEntityName(entity);
        setCurrentFieldName(fieldName);
        setShowModal(true);
    };

    const handleVariantField = (variantNumber: number, fieldName: string, value: any) => {
        setVariantField(variantNumber, fieldName, value);
    };

    return (
        <>
            {fields.map((fieldRow, index) => {
                const fieldName = variantNumber !== undefined ? `variants.${variantNumber}.${fieldRow.name}` : fieldRow.name;
                return (
                    <FormField
                        key={index}
                        control={form.control}
                        name={fieldName}
                        rules={{ required: fieldRow.required ? `${fieldRow.label} is required` : false }}

                        render={({ field }) => {
                            const handleChange = (value: any) => {
                                field.onChange(value);

                                if (variantNumber !== undefined) {
                                    handleVariantField(variantNumber, fieldRow.name, value);
                                }
                            };

                            return (
                                <FormItem>
                                    <FormLabel>{fieldRow.label} {fieldRow.required && <span className="text-red-500">*</span>}</FormLabel>
                                    <FormControl>
                                        {(() => {
                                            switch (fieldRow.type) {
                                                case "text":
                                                case "email":
                                                case "number":
                                                    return <TextField fieldRow={fieldRow} field={{ ...field, onChange: handleChange }} />;
                                                case "select":
                                                    return <SelectField fieldRow={fieldRow} field={{ ...field, onChange: handleChange }} options={
                                                        fieldRow.options?.filter((opt: any) => opt.role === selectedType || opt.role === "all")
                                                    } />;
                                                case "checkbox":
                                                    return <CheckboxField fieldRow={fieldRow} field={{ ...field, onChange: handleChange }} />;
                                                case "switch":
                                                    return <SwitchField fieldRow={fieldRow} field={{ ...field, onChange: handleChange }} />;
                                                case "radio":
                                                    return <RadioField fieldRow={fieldRow} field={{ ...field, onChange: handleChange }} />;
                                                case "foreignkey":
                                                    return (
                                                        <div className="flex ">
                                                            <div className="flex-1">
                                                                <SearchableSelect fieldRow={fieldRow} field={{ ...field, onChange: handleChange }}
                                                                    // options={filterData(data, field, selectedType)}
                                                                    options={
                                                                        filterData(
                                                                            data,
                                                                            fieldRow,
                                                                            selectedType,
                                                                            "brands",
                                                                            "product_type"
                                                                        )}
                                                                />
                                                            </div>
                                                            <div>
                                                                <ActionButton
                                                                    onClick={() => handleClick(fieldRow.entityName, fieldRow.name)}
                                                                    variant="outline"
                                                                    className="px-3 py-2 whitespace-nowrap"
                                                                    icon={<CirclePlus size={18} color="green" />}
                                                                    title={`Add ${fieldRow.filter}`}
                                                                />
                                                            </div>
                                                        </div>
                                                    );
                                                case "multiSelect":
                                                    return (
                                                        <div className="flex ">
                                                            <div className="flex-1">
                                                                <MultiSelectField fieldName={fieldName}
                                                                    fieldRow={fieldRow}
                                                                    options={parsedOptions(data?.['attribute-values'].filter((v: any) => v.attribute_name === fieldRow.filter),fieldRow.name)}

                                                                    control={form.control} />
                                                            </div>
                                                            <div>
                                                                <ActionButton
                                                                    onClick={() => handleClick(fieldRow.entityName, fieldRow.name)}
                                                                    variant="outline"
                                                                    className="px-3 py-2 whitespace-nowrap"
                                                                    icon={<CirclePlus size={18} color="green" />}
                                                                    title={`Add ${fieldRow.filter}`}
                                                                />
                                                            </div>

                                                        </div>
                                                    );
                                                case "multiCheckbox":
                                                    return (
                                                        <div className="flex w-full">
                                                            <div className="flex-1">
                                                                <MultiCheckbox fieldName={fieldName} fieldRow={fieldRow} 
                                                                    options={parsedOptions(data?.['attribute-values'].filter((v: any) => v.attribute_name === fieldRow.filter),fieldRow.name)}
                                                                control={form.control} />
                                                            </div>
                                                            <div>
                                                                <ActionButton
                                                                    onClick={() => handleClick(fieldRow.entityName, fieldRow.name)}
                                                                    variant="outline"
                                                                    className="px-3 py-2 whitespace-nowrap"
                                                                    icon={<CirclePlus size={18} color="green" />}
                                                                    title={`Add ${fieldRow.filter}`}
                                                                />
                                                            </div>

                                                        </div>
                                                    );
                                                default:
                                                    return null;
                                            }
                                        })()}
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            );
                        }}
                    />
                )
            }
            )}

        </>
    );
};


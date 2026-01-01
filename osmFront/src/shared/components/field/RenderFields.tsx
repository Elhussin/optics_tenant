
import { FormField, FormItem, FormLabel, FormMessage, FormControl } from "@/src/shared/components/shadcn/ui/form";
import { TextField, CheckboxField, SwitchField, RadioField, SelectField, SearchableSelect, MultiSelectField, MultiCheckbox } from "./Fields";
import { filterData } from "../../../features/products/utils/filterData";
import { useProductFormStore } from "@/src/features/products/store/useProductFormStore";
import { ActionButton } from "@/src/shared/components/ui/buttons";
import { CirclePlus } from "lucide-react";
import { RenderFormProps } from "@/src/features/products/types";
import { parsedOptions } from "@/src/features/products/utils/parsedOptions";

export const RenderFields = (props: RenderFormProps) => {
    const { fields, form, selectedType, variantNumber ,attributeIndex} = props;
    const { setShowModal, setEntityName, setCurrentFieldName, setVariantField, data } = useProductFormStore();
    // console.log(fields, selectedType, variantNumber)
    const handleClick = (entity: string, fieldName: string) => {
        setEntityName(entity);
        setCurrentFieldName(fieldName);
        setShowModal(true);
    };

    const handleVariantField = (variantNumber: number, fieldName: string, value: any) => {
        setVariantField(variantNumber, fieldName, value);
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {fields?.map((fieldRow, index) => {
                let fieldName = fieldRow.name;
                if (variantNumber !== undefined && attributeIndex !== undefined) {
                    fieldName = `variants.${variantNumber}.attributes.${attributeIndex}.${fieldRow.name}`;
                } else if (variantNumber !== undefined) {
                    fieldName = `variants.${variantNumber}.${fieldRow.name}`;
                }

                return (
                    <FormField
                        key={index}
                        control={form.control}
                        name={fieldName}
                        rules={{ required: fieldRow.required ? `${fieldRow.label} is required` : false }}
                        render={({ field }) => {
                            const handleChange = (value: any) => {
                                const finalValue = value?.target ? value.target.value : value;
                                field.onChange(finalValue);
                                if (variantNumber !== undefined) {
                                    handleVariantField(variantNumber, fieldRow.name, finalValue);
                                }
                            };

                            const isWideField = ["multiSelect", "multiCheckbox", "textarea"].includes(fieldRow.type || "");
                            const gridSpanClass = isWideField ? "col-span-1 md:col-span-2 lg:col-span-3" : "col-span-1";

                            return (
                                <FormItem className={gridSpanClass}>
                                    <div className="flex items-center gap-1 mb-1.5">
                                        <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                            {fieldRow.label} {fieldRow.required && <span className="text-red-500">*</span>}
                                        </FormLabel>
                                        <InfoPopover hint={fieldRow?.title || ""} />
                                    </div>
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
                                                        <div className="flex gap-2">
                                                            <div className="flex-1">
                                                                <SearchableSelect fieldRow={fieldRow} field={{ ...field, onChange: handleChange }}
                                                                    options={filterData(data, fieldRow, selectedType)}
                                                                />
                                                            </div>
                                                            <ActionButton
                                                                onClick={() => handleClick(fieldRow.entityName, fieldRow.name)}
                                                                variant="outline"
                                                                className="px-3 shrink-0"
                                                                icon={<CirclePlus size={18} className="text-blue-600 dark:text-blue-400" />}
                                                                title={`Add ${fieldRow.filter}`}
                                                            />
                                                        </div>
                                                    );
                                                case "multiSelect":
                                                    return (
                                                        <div className="flex gap-2">
                                                            <div className="flex-1">
                                                                <MultiSelectField fieldName={fieldName}
                                                                    fieldRow={fieldRow}
                                                                    options={filterData(data, fieldRow, selectedType)}
                                                                    control={form.control} />
                                                            </div>
                                                            <ActionButton
                                                                onClick={() => handleClick(fieldRow.entityName, fieldRow.name)}
                                                                variant="outline"
                                                                className="px-3 shrink-0"
                                                                icon={<CirclePlus size={18} className="text-blue-600 dark:text-blue-400" />}
                                                                title={`Add ${fieldRow.filter}`}
                                                            />
                                                        </div>
                                                    );
                                                case "multiCheckbox":
                                                    return (
                                                        <div className="flex gap-2 w-full">
                                                            <div className="flex-1">
                                                                <MultiCheckbox fieldName={fieldName} fieldRow={fieldRow}
                                                                    options={filterData(data, fieldRow, selectedType)}
                                                                    control={form.control} />
                                                            </div>
                                                            <ActionButton
                                                                onClick={() => handleClick(fieldRow.entityName, fieldRow.name)}
                                                                variant="outline"
                                                                className="px-3 shrink-0"
                                                                icon={<CirclePlus size={18} className="text-blue-600 dark:text-blue-400" />}
                                                                title={`Add ${fieldRow.filter}`}
                                                            />
                                                        </div>
                                                    );
                                                default:
                                                    return null;
                                            }
                                        })()}
                                    </FormControl>
                                    <FormMessage className="text-xs text-red-500 mt-1" />
                                </FormItem>
                            );
                        }}
                    />
                );
            })}
        </div>
    );
};




import { Popover, PopoverTrigger, PopoverContent } from "@/src/shared/components/shadcn/ui/popover";
import { InfoIcon } from "lucide-react";

export const InfoPopover = ({hint}:{hint :string}) => (
  <Popover>
    <PopoverTrigger>
      <InfoIcon className="w-5 h-5 text-gray-500 cursor-pointer" />
    </PopoverTrigger>
    <PopoverContent className="w-64 bg-surface">
      <p>{hint}</p>
    </PopoverContent>
  </Popover>
);

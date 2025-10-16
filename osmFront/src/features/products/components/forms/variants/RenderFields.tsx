

interface RenderFormProps {
    fields: any[];
    // selectedType: string;
    // variantNumber?: number | undefined;
    form: any;
    // onSubmit: any;
    options?: any[];
    selectedType?: string;
}
import {FormField, FormItem, FormLabel, FormMessage,FormControl } from "@/src/shared/components/shadcn/ui/form";
import { TextField,CheckboxField,SwitchField,RadioField,SelectField ,SearchableSelect,multiSelectField} from "./Fields";
import {filterData} from "./filterData";
import { useProductFormStore } from "@/src/features/product/store/useProductFormStore";
import { ActionButton } from "@/src/shared/components/ui/buttons";
import { CirclePlus } from "lucide-react";
  

export const RenderFields = (props: RenderFormProps) => {
    const { fields,form ,options,selectedType} = props;
    const { setShowModal, setEntityName, setCurrentFieldName, setVariantField, openVariantIndex ,data } = useProductFormStore();

    const handleClick = (entity: string, fieldName: string) => {
      setEntityName(entity);
      setCurrentFieldName(fieldName);
      setShowModal(true);
    };
    return (
        <>
        {fields.map((fieldRow,index) => (
          <FormField
            key={index}
            control={form.control}
            name={fieldRow.name}
            rules={{ required: fieldRow.required ? "This field is required" : false }}
            render={({ field}) => (
              <FormItem>
                <FormLabel>{fieldRow.label} {fieldRow.required && <span className="text-red-500">*</span>}</FormLabel>
                <FormControl>
                {(() => { switch (fieldRow.type){
                    case "text":
                    case "email":
                    case "number":
                        return <TextField fieldRow={fieldRow} field={field} />;
                    case "select":
                        return <SelectField fieldRow={fieldRow} field={field} options={
                            fieldRow.options.filter((opt: any) => opt.role === selectedType || opt.role === "all")
                        } />;
                    case "checkbox":
                        return <CheckboxField fieldRow={fieldRow} field={field} />;
                    case "switch":
                        return <SwitchField fieldRow={fieldRow} field={field} />;
                    case "radio":
                        return <RadioField fieldRow={fieldRow} field={field} />;
                    case "foreignkey":
                        return(
                            <div className="flex ">
                            <div className="flex-1">
                            <SearchableSelect fieldRow={fieldRow} field={field} options={
                            filterData(  data, field, selectedType)|| [{value:"",label:"Select"}]} />
                            </div>
                            <ActionButton
                                onClick={() => handleClick(fieldRow.entityName, fieldRow.name)}
                                variant="outline"
                                className="px-3 py-2 whitespace-nowrap"
                                icon={<CirclePlus size={18} color="green" />}
                                title={`Add ${fieldRow.filter}`}
                            />
                            </div>
                        );
                    
                    case "multiSelect":
                        return <multiSelectField fieldRow={fieldRow} options={fieldRow.options} control={form.control}/>;
                        //  options={
                        //     fieldRow.options.filter((opt: any) => opt.role === selectedType || opt.role === "all")
                        // } 
 
                    default:
                    return null;
                }
                })()}
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        ))}
        </>
    );


};


interface RenderFormProps {
    fields: any[];
    selectedType: string;
    variantNumber?: number | undefined;
    form: any;
    onSubmit: any;
}
import { Form, FormField, FormItem, FormLabel, FormMessage,FormControl } from "@/src/shared/components/shadcn/ui/form";
import { Button } from "@/src/shared/components/shadcn/ui/button";
import { TextField,CheckboxField,SwitchField,RadioField,SelectField } from "./Field";
import { SearchableSelect } from "./SearchableSelect";

const RenderForm = (props: RenderFormProps) => {
    const { fields, selectedType, variantNumber, form ,onSubmit} = props;

    return (
  
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 p-4 border rounded-lg max-w-md mx-auto">
        {fields.map((field) => (
          <FormField
            key={field.name}
            control={form.control}
            name={field.name}
            render={({ field: f }) => (
              <FormItem>
                <FormLabel>{field.label}</FormLabel>
                <FormControl>
                {(() => { switch (field.type){
                    case "text":
                    case "email":
                    case "number":
                        return <TextField field={field} f={f} />;
                    case "select":
                        return <SelectField field={field} f={f} options={field.options} />;
                    case "checkbox":
                        return <CheckboxField field={field} f={f} />;
                    case "switch":
                        return <SwitchField field={field} f={f} />;
                    case "radio":
                        return <RadioField field={field} f={f} />;
                    case "searchableSelect":
                        return <SearchableSelect field={field} f={f} options={field.options} />;
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
        <Button type="submit" className="w-full">Submit</Button>
      </form>
    </Form>
    );


};





                //   {(() => {
                //     switch (field.type) {
                //       case "text":
                //       case "email":
                //       case "number":
                //         return <Input type={field.type} placeholder={field.placeholder} {...f} />;
                //       case "textarea":
                //         return <Textarea placeholder={field.placeholder} {...f} />;
                //       case "select":
                //         if (isLoading) return <div>Loading...</div>;
                //         return (
                //           <Select onValueChange={f.onChange} value={f.value}>
                //             <SelectTrigger>
                //               <SelectValue placeholder={field.placeholder || "Select"} />
                //             </SelectTrigger>
                //             <SelectContent>

                //               {(field.options || [{value:"",label:""}]).map((opt: any) => (
                //                 <SelectItem key={opt.value} value={opt.value}>
                //                   {opt.label}
                //                 </SelectItem>
                //               ))}
                //             </SelectContent>
                //           </Select>
                //         );
                //       case "checkbox":
                //         return (
                //           <div className="flex items-center space-x-2">
                //             <Checkbox checked={f.value} onCheckedChange={f.onChange} />
                //             <span>{field.placeholder}</span>
                //           </div>
                //         );
                //       case "switch":
                //         return (
                //           <div className="flex justify-between items-center border p-2 rounded-md">
                //             <span>{field.placeholder}</span>
                //             <Switch checked={f.value} onCheckedChange={f.onChange} />
                //           </div>
                //         );
                //       case "radio":
 
                //       default:
                //         return null;
                //     }
                //   })()}
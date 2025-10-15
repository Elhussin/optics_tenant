
import { Checkbox } from "@/src/shared/components/shadcn/ui/checkbox";
import { Switch } from "@/src/shared/components/shadcn/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/src/shared/components/shadcn/ui/radio-group";
import { FormItem, FormControl, FormLabel } from "@/src/shared/components/shadcn/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/shared/components/shadcn/ui/select";
import { Input } from "@/src/shared/components/shadcn/ui/input";
import { Textarea } from "@/src/shared/components/shadcn/ui/textarea";

export const CheckboxField = ({ field, f }: any) => {
    return (
        <div className="flex items-center space-x-2">
            <Checkbox checked={f.value} onCheckedChange={f.onChange} />
            <span>{field.placeholder}</span>
        </div>
    );
};

export const SwitchField = ({ field, f }: any) => {
    return (
        <div className="flex justify-between items-center border p-2 rounded-md">
            <span>{field.placeholder}</span>
            <Switch checked={f.value} onCheckedChange={f.onChange} />
        </div>
    );
};

export const RadioField = ({ field, f }: any) => {
    return (
        <RadioGroup onValueChange={f.onChange} value={f.value} className="flex gap-3">
            {(field.options || []).map((opt: {value: string, label: string}) => (
                <FormItem key={opt.value} className="flex items-center space-x-2">
                    <FormControl>
                        <RadioGroupItem value={opt.value} />
                    </FormControl>
                    <FormLabel className="!mt-0">{opt.label}</FormLabel>
                </FormItem>
            ))}
        </RadioGroup>
    );
};

export const SelectField = ({field, f, options}: any) => {
    return (
        <Select onValueChange={f.onChange} value={f.value}>
        <SelectTrigger>
            <SelectValue placeholder={field.placeholder || "Select"} />
        </SelectTrigger>
        <SelectContent>

            {(field.options ||options || [{value:"",label:""}]).map((opt: any) => (
            <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
            </SelectItem>
            ))}
        </SelectContent>
        </Select>
    );
};

export const TextField = ({field, f}: any) => {
    return (
        <Input type={field.type} placeholder={field.placeholder} {...f} />
    );
};

export const NumberField = ({field, f}: any) => {
    return (
        <Input type="number" placeholder={field.placeholder} {...f} />
    );
};


export const TextareaField = ({field, f}: any) => {
    return (
        <Textarea placeholder={field.placeholder} {...f} />
    );
};

// "use client"

// import * as React from "react"
// import { Check, ChevronsUpDown } from "lucide-react"
// import { Button } from "@/components/ui/button"
// import {
//   Command,
//   CommandEmpty,
//   CommandGroup,
//   CommandInput,
//   CommandItem,
//   CommandList,
// } from "@/components/ui/command"
// import {
//   Popover,
//   PopoverContent,
//   PopoverTrigger,
// } from "@/components/ui/popover"
// import { cn } from "@/lib/utils"

// // القيم (من Enum مثلًا)
// const typeOptions = [
//   { value: "CL", label: "Classic" },
//   { value: "SL", label: "Slim" },
//   { value: "SG", label: "Signature" },
//   { value: "EW", label: "Everyday" },
//   { value: "AX", label: "Active" },
//   { value: "OT", label: "Other" },
//   { value: "DV", label: "Diverse" },
// ]

// export function TypeCombobox() {
//   const [open, setOpen] = React.useState(false)
//   const [value, setValue] = React.useState("")

//   return (
//     <Popover open={open} onOpenChange={setOpen}>
//       <PopoverTrigger asChild>
//         <Button
//           variant="outline"
//           role="combobox"
//           aria-expanded={open}
//           className="w-[240px] justify-between"
//         >
//           {value
//             ? typeOptions.find((option) => option.value === value)?.label
//             : "اختر النوع..."}
//           <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
//         </Button>
//       </PopoverTrigger>
//       <PopoverContent className="w-[240px] p-0">
//         <Command>
//           <CommandInput placeholder="ابحث عن النوع..." />
//           <CommandList>
//             <CommandEmpty>لا توجد نتائج</CommandEmpty>
//             <CommandGroup>
//               {typeOptions.map((option) => (
//                 <CommandItem
//                   key={option.value}
//                   value={option.value}
//                   onSelect={(currentValue) => {
//                     setValue(currentValue === value ? "" : currentValue)
//                     setOpen(false)
//                   }}
//                 >
//                   {option.label}
//                   <Check
//                     className={cn(
//                       "ml-auto h-4 w-4",
//                       value === option.value ? "opacity-100" : "opacity-0"
//                     )}
//                   />
//                 </CommandItem>
//               ))}
//             </CommandGroup>
//           </CommandList>
//         </Command>
//       </PopoverContent>
//     </Popover>
//   )
// }
import { RHFSelect } from "@/src/features/formGenerator/components/RHFSelect";

import { useTranslations } from "next-intl";
import { z } from "zod";

const TypeEnum = z.enum(["CL", "SL", "SG", "EW", "AX", "OT", "DV"]);

// export function useTypeOptions() {
//   const t = useTranslations("types"); // ملف ترجمة فيه القيم

//   return TypeEnum.options.map((opt) => ({
//     value: opt,
//     label: t(opt),
//   }));
// }

const select = [
  { "label": "Spherical", "name": "spherical", "type": "select", options: [{ "value": "1", "label": "1" }, { "value": "2", "label": "2" }] },
  { "label": "Cylinder", "name": "cylinder", "type": "select", options: [{ "value": "1", "label": "1" }, { "value": "2", "label": "2" }] },
  { "label": "Axis", "name": "axis", "type": "select", options: [{ "value": "1", "label": "1" }, { "value": "2", "label": "2" }] },
  { "label": "Addition", "name": "addition", "type": "select", options: [{ "value": "1", "label": "1" }, { "value": "2", "label": "2" }] },
  { "label": "Type", "name": "type", "type": "select", options:TypeEnum.options},
]


export const RenderSelect = ({ fieldName, form, options, label, required }: any) => {
    return (
      <>
        {label && (
          <label htmlFor={fieldName} className="block font-medium text-sm m-1">
            {label}
            {required ? <span className="text-red-500"> *</span> : ''}
          </label>
        )}

        <RHFSelect
          name={fieldName}
          control={form.control}
          parsedOptions={options}
          label={label}
          required={required}
          placeholder="Select a value"
          className="flex-1" // يملأ المساحة المتبقية
        />
      </>
    )
}
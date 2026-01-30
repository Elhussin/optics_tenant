"use client";
import { useState } from "react";
import { Checkbox } from "@/src/shared/components/shadcn/ui/checkbox";
import { Switch } from "@/src/shared/components/shadcn/ui/switch";
import {
  RadioGroup,
  RadioGroupItem,
} from "@/src/shared/components/shadcn/ui/radio-group";
import {
  FormItem,
  FormControl,
  FormLabel,
} from "@/src/shared/components/shadcn/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/shared/components/shadcn/ui/select";
import { Input } from "@/src/shared/components/shadcn/ui/input";
import { Textarea } from "@/src/shared/components/shadcn/ui/textarea";
import { Button } from "@/src/shared/components/shadcn/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/src/shared/components/shadcn/ui/popover";
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/src/shared/components/shadcn/ui/command";
import {
  Check,
  ChevronsUpDown,
  X,
  CheckSquare,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/src/shared/utils/cn";
import {
  FieldsProps,
  SelectFieldsProps,
  MultiSelectFieldProps,
} from "@/src/features/products/types";
import { Badge } from "@/src/shared/components/shadcn/ui/badge";
import { useForm, Controller } from "react-hook-form";
import { StringToBoolean } from "class-variance-authority/types";

/**
 * ✨ CheckboxField - حقل Checkbox محسّن مع Premium Design
 */
export const CheckboxField = ({ fieldRow, field }: FieldsProps) => {
  return (
    <div className="flex items-center gap-3 h-11 px-0 transition-all duration-300 animate-fade-in-up group">
      <Checkbox
        id={fieldRow.name}
        checked={field.value}
        onCheckedChange={field.onChange}
        className="transition-all duration-300 data-[state=checked]:scale-110 border-primary/50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
      />
      <div className="flex-1">
        <label
          htmlFor={fieldRow.name}
          className="cursor-pointer text-sm font-medium text-foreground flex items-center gap-2 select-none"
        >
          {fieldRow.placeholder || fieldRow.label}
          {fieldRow.required && (
            <span className="text-destructive text-xs">*</span>
          )}
        </label>
      </div>
    </div>
  );
};

/**
 * ✨ SwitchField - حقل Switch محسّن مع glass effect
 */
export const SwitchField = ({ fieldRow, field }: FieldsProps) => {
  return (
    <div className="flex justify-between items-center gap-3 px-4 py-2 border border-primary/50 rounded-lg bg-surface transition-all duration-300 cursor-pointer hover:border-primary/70 hover:shadow-sm animate-fade-in-up">
      <span className="text-sm font-medium">{fieldRow.placeholder}</span>
      <Switch
        checked={field.value}
        onCheckedChange={field.onChange}
        className="transition-all duration-300 data-[state=checked]:scale-105"
      />
    </div>
  );
};

/**
 * ✨ RadioField - حقل Radio محسّن مع animations
 */
export const RadioField = ({ fieldRow, field }: FieldsProps) => {
  return (
    <RadioGroup
      onValueChange={field.onChange}
      value={field.value}
      className="flex gap-3 flex-wrap animate-fade-in-up"
    >
      {(fieldRow.options || []).map((opt, index) => (
        <FormItem
          key={String(opt.value)}
          className="flex items-center gap-2 px-4 py-2 border border-primary/50 rounded-lg bg-surface transition-all duration-300 cursor-pointer hover:border-primary/70 hover:shadow-sm"
          style={{ animationDelay: `${index * 50}ms` }}
        >
          <FormControl>
            <RadioGroupItem
              value={String(opt.value)}
              className="transition-all duration-300 data-[state=checked]:scale-110"
            />
          </FormControl>
          <FormLabel className="!mt-0 cursor-pointer select-none text-sm font-medium">
            {opt.label}
          </FormLabel>
        </FormItem>
      ))}
    </RadioGroup>
  );
};

/**
 * ✨ TextField - حقل نص محسّن مع double border focus effects
 */
export const TextField = ({ fieldRow, field }: FieldsProps) => {
  return (
    <Input
      type={fieldRow.type}
      placeholder={fieldRow.placeholder}
      {...field}
      value={field.value ?? ""}
      className={cn(
        "w-full h-11 px-4 py-2 text-sm bg-surface border border-primary/50 rounded-lg transition-all duration-300 placeholder:text-secondary focus-visible:outline-none focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary/20 hover:border-primary/70 hover:shadow-sm disabled:cursor-not-allowed disabled:opacity-50 animate-fade-in-up",
        "file:border-0 file:bg-transparent file:text-sm file:font-medium",
        fieldRow.className,
      )}
    />
  );
};

/**
 * ✨ FileField - حقل رفع ملفات محسّن
 */
export const FileField = ({ fieldRow, field }: FieldsProps) => {
  return (
    <Input
      type="file"
      {...field}
      value={undefined}
      onChange={(e) => {
        const files = e.target.files;
        if (files && files.length > 0) {
          field.onChange(files[0]);
        }
      }}
      className={cn(
        "w-full h-11 px-4 py-2 text-sm bg-surface border border-primary/50 rounded-lg transition-all duration-300 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-secondary focus-visible:outline-none focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary/20 hover:border-primary/70 hover:shadow-sm cursor-pointer file:cursor-pointer animate-fade-in-up",
        fieldRow.className,
      )}
    />
  );
};

/**
 * ✨ TextareaField - حقل نص متعدد الأسطر محسّن مع double border
 */
export const TextareaField = ({ fieldRow, field }: FieldsProps) => {
  return (
    <Textarea
      placeholder={fieldRow.placeholder}
      {...field}
      value={field.value ?? ""}
      className="w-full min-h-[100px] px-4 py-2 text-sm bg-surface border border-primary/50 rounded-lg transition-all duration-300 placeholder:text-secondary focus-visible:outline-none focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary/20 hover:border-primary/70 hover:shadow-sm disabled:cursor-not-allowed disabled:opacity-50 resize-none scrollbar-thin animate-fade-in-up"
      required={fieldRow.required}
    />
  );
};

/**
 * ✨ SelectField - حقل اختيار محسّن مع double border
 */
export const SelectField = ({
  fieldRow,
  field,
  options,
}: SelectFieldsProps) => {
  return (
    <Select onValueChange={field.onChange} value={field.value ?? ""}>
      <SelectTrigger className="w-full h-11 px-4 py-2 text-sm bg-surface border border-primary/50 rounded-lg transition-all duration-300 focus-visible:outline-none focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary/20 hover:border-primary/70 hover:shadow-sm cursor-pointer animate-fade-in-up">
        <SelectValue placeholder={fieldRow.placeholder || "Select"} />
      </SelectTrigger>
      <SelectContent className="border border-primary/50 bg-surface animate-fade-in-down">
        {(options || fieldRow.options || [{ value: "", label: "" }]).map(
          (opt: any, index: number) => (
            <SelectItem
              className="cursor-pointer transition-colors bg-surface hover:bg-primary/10 hover:text-primary focus:bg-primary/10 focus:text-primary data-[state=checked]:bg-primary/10 data-[state=checked]:text-primary data-[state=checked]:font-semibold"
              key={index}
              value={String(opt.value)}
            >
              {opt.label}
            </SelectItem>
          ),
        )}
      </SelectContent>
    </Select>
  );
};

/**
 * ✨ SearchableSelect - حقل اختيار قابل للبحث مع animations
 */
export function SearchableSelect({
  fieldRow,
  options,
  field,
}: SelectFieldsProps) {
  const [open, setOpen] = useState(false);
  const selectedLabel = options?.find((o) => o.value === field.value)?.label;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between h-11 px-4 font-normal rounded-lg transition-all duration-300 bg-surface border border-primary/50 focus:outline-none hover:border-primary/70 hover:shadow-sm animate-fade-in-up",
            open && "border-primary ring-1 ring-primary/20",
          )}
        >
          {selectedLabel ? (
            <span className="truncate font-medium">{selectedLabel}</span>
          ) : (
            <span className="text-muted-foreground">
              {fieldRow.placeholder || "Select..."}
            </span>
          )}
          <ChevronsUpDown
            className={cn(
              "ml-2 h-4 w-4 shrink-0 opacity-50 transition-transform",
              open && "rotate-180",
            )}
          />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        className="w-[300px] p-0 border border-primary/50 bg-surface animate-fade-in-down"
        align="start"
      >
        <Command className="bg-surface">
          <CommandInput
            placeholder={`Search ${fieldRow.label || "..."}...`}
            className="h-11 px-4 border-b border-primary/20"
          />
          <CommandList className="scrollbar-thin">
            <CommandEmpty className="py-6 text-center text-muted-foreground">
              No results found.
            </CommandEmpty>
            <CommandGroup>
              {options?.map((opt, index) => {
                const isSelected = field.value === opt.value;
                return (
                  <CommandItem
                    className={cn(
                      "cursor-pointer px-4 py-2.5 transition-colors hover:bg-primary/10 animate-fade-in-left",
                      isSelected && "bg-primary/10 font-semibold text-primary",
                    )}
                    style={{ animationDelay: `${index * 30}ms` }}
                    key={index}
                    value={opt.label}
                    onSelect={() => {
                      field.onChange(opt.value);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4 transition-all",
                        isSelected
                          ? "opacity-100 scale-110 text-primary"
                          : "opacity-0 scale-75",
                      )}
                    />
                    <span
                      className={cn(isSelected && "font-semibold text-primary")}
                    >
                      {opt.label}
                    </span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

/**
 * ✨ MultiCheckbox - مربعات اختيار متعددة محسّنة مع Premium Design
 */
export const MultiCheckbox = ({
  fieldName,
  fieldRow,
  control,
  options,
}: MultiSelectFieldProps) => {
  const DefaultOptions = options || fieldRow.options || [];
  return (
    <Controller
      name={fieldName}
      control={control}
      defaultValue={[] as any}
      render={({ field }) => (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 animate-fade-in-up">
          {DefaultOptions?.map((opt: any, index: number) => {
            const isSelected = (field.value || []).includes(opt.value);

            return (
              <div
                key={index}
                className={cn(
                  "flex items-start gap-3 px-4 py-2 border border-primary/50 rounded-lg bg-surface transition-all duration-300 cursor-pointer hover:border-primary/70 hover:shadow-sm group",
                  isSelected && "border-primary bg-primary/10",
                )}
                style={{ animationDelay: `${index * 40}ms` }}
              >
                <Checkbox
                  id={opt.value}
                  checked={isSelected}
                  onCheckedChange={(checked) => {
                    const currentValues = field.value || [];
                    const newValue = checked
                      ? [...currentValues, opt.value]
                      : currentValues.filter((v: string) => v !== opt.value);
                    field.onChange(newValue);
                  }}
                  className="mt-0.5 transition-all duration-300 data-[state=checked]:scale-110"
                />
                <div className="flex-1">
                  <label
                    htmlFor={opt.value}
                    className="cursor-pointer text-sm font-medium text-foreground flex items-center gap-2 select-none"
                  >
                    <CheckSquare
                      size={16}
                      className={cn(
                        "transition-transform",
                        isSelected
                          ? "text-primary scale-110"
                          : "text-muted-foreground group-hover:text-primary group-hover:scale-110",
                      )}
                    />
                    {opt.label}
                  </label>
                </div>
              </div>
            );
          })}
        </div>
      )}
    />
  );
};

/**
 * ✨ MultiSelectField - حقل اختيار متعدد محسّن مع badges
 */
export function MultiSelectField({
  control,
  fieldName,
  options,
}: MultiSelectFieldProps) {
  const [open, setOpen] = useState(false);

  return (
    <Controller
      name={fieldName}
      control={control}
      defaultValue={[] as any}
      render={({ field }) => {
        const value = Array.isArray(field.value)
          ? field.value
          : field.value
          ? [field.value]
          : [];
        const selected =
          options?.filter((opt: any) => value.includes(opt.value)) || [];

        return (
          <div className="flex flex-col gap-2 animate-fade-in-up">
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-between h-auto min-h-[2.75rem] px-4 font-normal rounded-lg transition-all duration-300 bg-surface border border-primary/50 focus:outline-none hover:border-primary/70 hover:shadow-sm animate-fade-in-up",
                    open && "border-primary ring-1 ring-primary/20",
                  )}
                  type="button"
                >
                  {selected.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5 py-1">
                      {selected.map((s, index) => (
                        <Badge
                          key={s.value}
                          variant="secondary"
                          className="text-xs flex items-center gap-1.5 px-2.5 py-1 transition-all duration-200 hover:scale-105 animate-fade-in-left"
                          style={{ animationDelay: `${index * 30}ms` }}
                        >
                          <span className="font-medium">{s.label}</span>
                          <X
                            className="w-3.5 h-3.5 cursor-pointer hover:text-destructive transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              field.onChange(
                                value.filter((v) => v !== s.value),
                              );
                            }}
                          />
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <span className="text-muted-foreground py-1">
                      Select options...
                    </span>
                  )}
                  <div className="flex items-center gap-2 ml-2">
                    {selected.length > 0 && (
                      <Badge
                        variant="outline"
                        className="text-xs px-2 py-0.5 font-semibold animate-scale-in"
                      >
                        {selected.length}
                      </Badge>
                    )}
                    <ChevronsUpDown
                      className={cn(
                        "w-4 h-4 opacity-50 transition-transform flex-shrink-0",
                        open && "rotate-180",
                      )}
                    />
                  </div>
                </Button>
              </PopoverTrigger>

              <PopoverContent className="p-0 w-[300px] border border-primary/50 bg-surface animate-fade-in-down">
                <Command className="bg-surface">
                  <CommandInput
                    placeholder="Search options..."
                    className="h-11 px-4 border-b border-primary/20"
                  />
                  <CommandList className="scrollbar-thin max-h-64">
                    <CommandEmpty className="py-6 text-center text-muted-foreground">
                      No options found.
                    </CommandEmpty>
                    <CommandGroup>
                      {options?.map((opt, index) => {
                        const isSelected = value.includes(opt.value);
                        return (
                          <CommandItem
                            className={cn(
                              "cursor-pointer px-4 py-2.5 transition-colors hover:bg-primary/10 animate-fade-in-left",
                              isSelected &&
                                "bg-primary/10 font-semibold text-primary",
                            )}
                            style={{ animationDelay: `${index * 30}ms` }}
                            key={opt.value}
                            onSelect={() => {
                              const newValue = isSelected
                                ? value.filter((v) => v !== opt.value)
                                : [...value, opt.value];
                              field.onChange(newValue);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4 transition-all",
                                isSelected
                                  ? "opacity-100 scale-110 text-primary"
                                  : "opacity-0 scale-75",
                              )}
                            />
                            <span
                              className={cn(
                                isSelected && "font-semibold text-primary",
                              )}
                            >
                              {opt.label}
                            </span>
                          </CommandItem>
                        );
                      })}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
        );
      }}
    />
  );
}

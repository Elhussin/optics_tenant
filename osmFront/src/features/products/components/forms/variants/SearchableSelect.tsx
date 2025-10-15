"use client";

import * as React from "react";
import { Button } from "@/src/shared/components/shadcn/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/src/shared/components/shadcn/ui/popover";
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from "@/src/shared/components/shadcn/ui/command";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/src/shared/utils/cn";

// لاحظ أننا نحذف useState للـ value لأنها ستأتي من form
export function SearchableSelect({
  field,
  form,
  options,
  f,

  // options,
  // value,
  // onChange,
  // placeholder = "Select option...",
}: {
  options: { label: string; value: string | number }[];
  value: string | number | undefined;
  onChange: (val: string | number) => void;
  placeholder?: string;
}) {
  const [open, setOpen] = React.useState(false);

  const selectedLabel = options.find((o) => o.value === field.value)?.label;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {selectedLabel || field.placeholder}
          <ChevronsUpDown className="opacity-50 h-4 w-4" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search..." />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup>
              {options.map((opt) => (
                <CommandItem
                  key={opt.value}
                  value={String(opt.value)}
                  onSelect={() => {
                    f.onChange(opt.value); // 🔹 نحدث القيمة في الـ form
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === opt.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {opt.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

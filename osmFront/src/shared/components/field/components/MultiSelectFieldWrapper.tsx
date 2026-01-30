/**
 * ✨ MultiSelectFieldWrapper - MultiSelect مع زر إضافة
 * @description Multi-select field with add button
 */

"use client";

import React from "react";
import { MultiSelectField } from "../Fields";
import { ActionButton } from "@/src/shared/components/ui/buttons";
import { Plus } from "lucide-react";
import { cn } from "@/src/shared/utils/cn";

interface MultiSelectFieldWrapperProps {
  fieldName: string;
  fieldRow: any;
  control: any;
  options: any[];
  onAddNew?: (entityName: string, fieldName: string) => void;
}

export const MultiSelectFieldWrapper = React.memo(
  ({
    fieldName,
    fieldRow,
    control,
    options,
    onAddNew,
  }: MultiSelectFieldWrapperProps) => {
    return (
      <div className="flex gap-2 items-start animate-fade-in-up">
        <div className="flex-1">
          <MultiSelectField
            fieldName={fieldName}
            fieldRow={fieldRow}
            options={options}
            control={control}
          />
        </div>
        {onAddNew && (
          <ActionButton
            onClick={() => onAddNew(fieldRow.entityName, fieldRow.name)}
            variant="icon-success"
            size="md"
            className={cn(
              "h-11 w-11 shrink-0 rounded-lg",
              "transition-all duration-300",
              "border border-success/30 hover:border-success",
              "bg-success/5 hover:bg-success/10 text-success",
              "shadow-sm hover:shadow",
            )}
            icon={<Plus size={20} />}
            title={`Add ${fieldRow.filter}`}
          />
        )}
      </div>
    );
  },
);

MultiSelectFieldWrapper.displayName = "MultiSelectFieldWrapper";

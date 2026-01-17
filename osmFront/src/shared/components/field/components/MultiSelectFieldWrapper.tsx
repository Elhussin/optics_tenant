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
      <div className="flex gap-2">
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
            className={cn("rounded-xl mt-0.5 shrink-0", "transition-smooth hover-scale", "border-2 hover:border-primary/50")}

            icon={<Plus size={18} />}
            title={`Add ${fieldRow.filter}`}
          />
        )}
      </div>
    );
  }
);
 
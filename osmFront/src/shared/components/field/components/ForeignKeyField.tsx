/**
 * ✨ ForeignKeyField - حقل Foreign Key مع زر إضافة
 * @description Foreign key field with add button
 */

"use client";

import React from "react";
import { SearchableSelect } from "../Fields";
import { ActionButton } from "@/src/shared/components/ui/buttons";
import { Plus } from "lucide-react";
import { cn } from "@/src/shared/utils/cn";

interface ForeignKeyFieldProps {
  fieldRow: any;
  field: any;
  options: any[];
  onAddNew?: (entityName: string, fieldName: string) => void;
}

export const ForeignKeyField = React.memo(
  ({ fieldRow, field, options, onAddNew }: ForeignKeyFieldProps) => {
    return (
      <div className="flex gap-2 items-start animate-fade-in-up">
        <div className="flex-1">
          <SearchableSelect
            fieldRow={fieldRow}
            field={field}
            options={options}
          />
        </div>
        {onAddNew && (
          <ActionButton
            onClick={() => onAddNew(fieldRow.entityName, fieldRow.name)}
            variant="icon-success"
            size="md"
            icon={<Plus size={20} />}
            className={cn(
              "h-11 w-11 shrink-0 rounded-lg",
              "transition-all duration-300",
              "border border-success/30 hover:border-success",
              "bg-success/5 hover:bg-success/10 text-success",
              "shadow-sm hover:shadow",
            )}
            title={`Add ${fieldRow.filter}`}
          />
        )}
      </div>
    );
  },
);

ForeignKeyField.displayName = "ForeignKeyField";

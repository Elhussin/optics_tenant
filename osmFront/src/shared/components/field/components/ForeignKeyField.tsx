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
      <div className="flex gap-2">
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
            icon={<Plus size={18} />}
            className={cn(
              "rounded-xl mt-0.5 shrink-0",
              "transition-smooth hover-scale",
              "border-2 hover:border-primary/50",
            )}
            title={`Add ${fieldRow.filter}`}
          />
        )}
      </div>
    );
  },
);

ForeignKeyField.displayName = "ForeignKeyField";

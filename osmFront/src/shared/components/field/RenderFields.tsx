/**
 * ✨ RenderFields Component - محسّن مع Architecture Improvements
 * @description مكون محسّن لعرض الحقول الديناميكية مع performance optimization
 */

"use client";

import React, { useMemo, useCallback } from "react";
import {
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormControl,
} from "@/src/shared/components/shadcn/ui/form";

import { cn } from "@/src/shared/utils/cn";
import { filterData } from "../../../features/products/utils/filterData";
import { RenderFormProps } from "@/src/features/products/types";
import { useProductFormStore } from "@/src/features/products/store/useProductFormStore";
import {
  getFieldComponent,
  isRegisteredFieldType,
} from "./registry/fieldRegistry";
import {
  getFieldName,
  extractFieldValue,
  getGridSpanClass,
} from "./utils/fieldUtils";
import { InfoPopover } from "./InfoPopover";
/**
 * ✨ Single Field Renderer - مُحسّن مع Memoization
 */
const FieldRenderer = React.memo(
  ({
    fieldRow,
    fieldName,
    form,
    selectedType,
    data,
    onAddNew,
    onVariantFieldChange,
    variantNumber,
    index,
  }: any) => {
    // Get filtered options (memoized)
    const filteredOptions = useMemo(() => {
      if (fieldRow.type === "select") {
        return fieldRow.options?.filter(
          (opt: any) =>
            !opt.role || opt.role === selectedType || opt.role === "all"
        );
      }

      if (
        ["foreignkey", "multiSelect", "multiCheckbox"].includes(fieldRow.type)
      ) {
        return filterData(data, fieldRow, selectedType);
      }

      return fieldRow.options;
    }, [fieldRow, selectedType, data]);

    // Get field component
    const FieldComponent = getFieldComponent(fieldRow.type);

    if (!FieldComponent) {
      console.warn(`Unknown field type: ${fieldRow.type}`);
      return null;
    }

    return (
      <FormField
        control={form.control}
        name={fieldName}
        rules={{
          required: fieldRow.required ? `${fieldRow.label} is required` : false,
        }}
        render={({ field }) => {
          const handleChange = (value: any) => {
            const finalValue = extractFieldValue(value);
            field.onChange(finalValue);

            if (variantNumber !== undefined && onVariantFieldChange) {
              onVariantFieldChange(variantNumber, fieldRow.name, finalValue);
            }
          };

          const gridSpanClass = getGridSpanClass(fieldRow.type || "");

          return (
            <FormItem
              className={cn(gridSpanClass, "animate-fade-in-up")}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {/* ✨ Enhanced Label with InfoPopover */}
              <div className="flex items-center gap-2 mb-2">
                <FormLabel
                  className={cn(
                    "text-sm font-semibold text-foreground",
                    "transition-colors"
                  )}
                >
                  {fieldRow.label}
                  {fieldRow.required && (
                    <span className="text-destructive ml-1 animate-pulse-slow text-danger">
                      *
                    </span>
                  )}
                </FormLabel>
                {fieldRow?.title && <InfoPopover hint={fieldRow.title} />}
              </div>

              <FormControl>
                <FieldComponent
                  fieldRow={fieldRow}
                  fieldName={fieldName}
                  field={{ ...field, onChange: handleChange }}
                  options={filteredOptions}
                  control={form.control}
                  onAddNew={onAddNew}
                />
              </FormControl>

              {/* ✨ Enhanced Error Message */}
              <FormMessage
                className={cn(
                  "text-xs text-destructive text-danger mt-1.5",
                  "animate-fade-in-up font-medium"
                )}
              />
            </FormItem>
          );
        }}
      />
    );
  }
);

FieldRenderer.displayName = "FieldRenderer";

/**
 * ✨ RenderFields - المكون الرئيسي المحسّن
 */
export const RenderFields = ({
  fields,
  form,
  selectedType,
  variantNumber,
  attributeIndex,
  onAddNew,
  onVariantFieldChange,
}: RenderFormProps) => {
  // Memoize field names
  const fieldsWithNames = useMemo(() => {
    return fields?.map((fieldRow) => ({
      ...fieldRow,
      fullName: getFieldName(fieldRow.name, variantNumber, attributeIndex),
    }));
  }, [fields, variantNumber, attributeIndex]);

  // Callback for adding new items
  const handleAddNew = useCallback(
    (entityName: string, fieldName: string) => {
      if (onAddNew) {
        onAddNew(entityName, fieldName);
      }
    },
    [onAddNew]
  );

  // Callback for variant field changes
  const handleVariantFieldChange = useCallback(
    (varNum: number, fieldName: string, value: any) => {
      if (onVariantFieldChange) {
        onVariantFieldChange(varNum, fieldName, value);
      }
    },
    [onVariantFieldChange]
  );

  // ✨ Get data from store - FIXED with correct path!
  const store = useProductFormStore();
  const data = useMemo(() => {
    return {
      categories: store.data.categories || [],
      brands: store.data.brands || [],
      suppliers: store.data.suppliers || [],
      manufacturers: store.data.manufacturers || [],
      attributes: store.data.attributes || [],
      "attribute-values": store.data["attribute-values"] || [],
    };
  }, [
    store.data.categories,
    store.data.brands,
    store.data.suppliers,
    store.data.manufacturers,
    store.data.attributes,
    store.data["attribute-values"],
  ]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {fieldsWithNames?.map((fieldRow, index) => {
        // Skip unregistered field types
        if (!isRegisteredFieldType(fieldRow.type || "")) {
          return null;
        }

        return (
          <FieldRenderer
            key={fieldRow.fullName}
            fieldRow={fieldRow}
            fieldName={fieldRow.fullName}
            form={form}
            selectedType={selectedType}
            data={data}
            onAddNew={handleAddNew}
            onVariantFieldChange={handleVariantFieldChange}
            variantNumber={variantNumber}
            index={index}
          />
        );
      })}
    </div>
  );
};


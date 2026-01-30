"use client";

import { z } from "zod";
import { useEffect, useRef } from "react";
import { detectFieldType } from "../utils/detectFieldType";
import { useFieldOptions } from "../hooks/useFieldOptions";
import { unwrapSchema } from "../utils/unwrapSchema";
import { isFieldRequired } from "../utils";
import { fieldTemplates } from "../constants/generatFormConfig";
import { cn } from "@/src/shared/utils/cn";
import { Skeleton } from "@/src/shared/components/ui/Skeleton";
import { Controller } from "react-hook-form";
import {
  Mail,
  Lock,
  Link as LinkIcon,
  Type,
  Hash,
  Calendar,
  FileText,
  List,
  CheckSquare,
  AlertCircle,
  Info,
} from "lucide-react";
import { getFieldComponent } from "@/src/shared/components/field/registry/fieldRegistry";
import {
  FormLabel,
  FormMessage,
  FormItem,
  FormField,
  FormControl,
} from "@/src/shared/components/shadcn/ui/form";
import { InfoPopover } from "@/src/shared/components/field/RenderFields"; // Import InfoPopover if available or create local

// Field Icons Mapping
const fieldIcons: Record<string, any> = {
  email: Mail,
  password: Lock,
  url: LinkIcon,
  text: Type,
  number: Hash,
  date: Calendar,
  datetime: Calendar,
  textarea: FileText,
  select: List,
  checkbox: CheckSquare,
  default: Type,
};

const getFieldIcon = (fieldName: string, fieldType: string) => {
  // Check field name first
  if (fieldName.includes("email")) return Mail;
  if (fieldName.includes("password")) return Lock;
  if (fieldName.includes("url") || fieldName.includes("link")) return LinkIcon;
  if (fieldName.includes("date")) return Calendar;

  // Then check field type
  return fieldIcons[fieldType] || fieldIcons.default;
};

// ============================
// RenderField Component
// ============================
export const RenderField = ({
  fieldName,
  fieldSchema,
  form,
  config,
  mode,
  setShowModal,
  fetchForginKey,
  setFetchForginKey,
  t,
}: any) => {
  const fieldType = detectFieldType(fieldName, fieldSchema);
  const template = fieldTemplates[fieldType] ||
    fieldTemplates["text"] || {
      component: "input",
      type: "text",
    };

  const unwrappedSchema = unwrapSchema(fieldSchema);
  const label = t(fieldName);
  const required = isFieldRequired(fieldSchema);
  const Icon = getFieldIcon(fieldName, fieldType);

  // Handle select / foreignkey options
  const {
    data: options,
    loading,
    refetch,
    rawData,
    relationConfig,
  } = useFieldOptions(fieldName, fieldType, unwrappedSchema as z.ZodEnum<any>);

  const expectingUpdate = useRef(false);

  useEffect(() => {
    if (fetchForginKey) {
      expectingUpdate.current = true;
      refetch?.(); // Safe call if refetch is available
      setFetchForginKey(false);
    }
  }, [fetchForginKey, refetch, setFetchForginKey]);

  useEffect(() => {
    if (expectingUpdate.current && rawData?.length > 0 && relationConfig) {
      // Assuming the last item in the list is the newly created one
      const lastItem = rawData[rawData.length - 1];
      if (lastItem) {
        form.setValue(fieldName, lastItem[relationConfig.valueField]);
      }
      expectingUpdate.current = false;
    }
  }, [rawData, fieldName, relationConfig, form]);

  useEffect(() => {
    if (!loading && options?.length) {
      const currentValue = form.getValues(fieldName);
      const exists = options.some((o: any) => o.value === currentValue);
      // Only set from defaultValue if current value doesn't exist in options AND we are not expecting an update
      if (!exists && !expectingUpdate.current) {
        const defaultValue = form.formState.defaultValues?.[fieldName];
        if (defaultValue) {
          form.setValue(fieldName, defaultValue);
        }
      }
    }
  }, [loading, options, fieldName, form]);

  // Enhanced Loading Skeleton
  if (loading) {
    return (
      <div className="col-span-1 space-y-2">
        <Skeleton variant="text" width={120} height={20} />
        <Skeleton variant="button" width="100%" height={44} />
      </div>
    );
  }

  // Map to Shared Field Registry Type
  let registryType = "text";
  if (fieldType === "boolean" || fieldType === "checkbox")
    registryType = "checkbox"; // or switch
  else if (fieldType === "select" || fieldType === "union")
    registryType = "select";
  else if (fieldType === "foreignkey") registryType = "foreignkey";
  else if (fieldType === "foreignkey-array") registryType = "multiSelect";
  // Mapping foreignkey-array to multiSelect wrapper
  else if (fieldType === "textarea") registryType = "textarea";
  else if (fieldType === "date" || fieldType === "datetime")
    registryType = "text"; // TODO: Add date picker
  else if (template.type === "number") registryType = "number";
  else if (template.type === "email") registryType = "email";
  else if (fieldType === "file") registryType = "file";

  const FieldComponent = getFieldComponent(registryType);

  if (!FieldComponent) {
    return (
      <div className="text-red-500">
        {t("unsupportedField")} {fieldType} ({registryType})
      </div>
    );
  }

  // Construct FieldRow object expected by shared components
  const fieldRow = {
    name: fieldName,
    label: label,
    type: template.type || registryType,
    required: required,
    placeholder: label, //  t("enter") + " " +
    options: options,
    title: config?.[fieldName]?.helpText, // Optional help text
    entityName: config?.[fieldName]?.entityName, // For ForeignKey
    filter: config?.[fieldName]?.filter, // For ForeignKey
    className: fieldType === "textarea" ? "min-h-[120px]" : "",
    // Pass specific props
    ...template.props,
  };

  // Wrapper for layout
  const gridClass =
    fieldType === "textarea" || fieldType === "array" || fieldType === "object"
      ? "col-span-1 md:col-span-2"
      : "col-span-1";

  // Check if we should render label (skip for checkboxes if handled internally, but for now enable all to match shared pattern)
  // Or better, stick to shared RenderFields pattern which always renders label unless specific overrides.

  return (
    <FormField
      control={form.control}
      name={fieldName}
      render={({ field }) => (
        <FormItem className={cn(gridClass, "space-y-2 animate-fade-in-up")}>
          <div className="flex items-center gap-2 mb-2">
            <FormLabel
              className={cn(
                "text-sm font-semibold text-foreground flex items-center gap-2",
                "transition-colors",
                // Error color is handled by FormLabel automatically via useFormField context
              )}
            >
              {Icon && <Icon size={16} className={cn("text-primary")} />}
              {label}
              {required && (
                <span className="text-destructive ml-1 animate-pulse-slow text-danger">
                  *
                </span>
              )}
            </FormLabel>
            {fieldRow.title && (
              <div className="text-muted-foreground hover:text-primary transition-colors cursor-help">
                <Info size={14} />
              </div>
            )}
          </div>

          <FormControl>
            <FieldComponent
              fieldRow={fieldRow}
              field={field}
              options={options}
              control={form.control}
              onAddNew={setShowModal ? () => setShowModal(true) : undefined}
              fieldName={fieldName}
            />
          </FormControl>

          <FormMessage className="text-xs text-danger mt-1.5 animate-fade-in font-medium flex items-center gap-1.5" />
        </FormItem>
      )}
    />
  );
};

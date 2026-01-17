"use client";

import { z } from "zod";
import { useEffect } from "react";
import { detectFieldType } from "../utils/detectFieldType";
import { ForeignKeyField } from "./ForeignKeyField";
import { UnionField } from "./UnionField";
import { useFieldOptions } from "../hooks/useFieldOptions";
import { unwrapSchema } from "../utils/unwrapSchema";
import { getFieldLabel, isFieldRequired } from "../utils";
import { fieldTemplates } from "../constants/generatFormConfig";
import { RHFSelect } from "./RHFSelect";
import { cn } from "@/src/shared/utils/cn";
import { Skeleton } from "@/src/shared/components/ui/Skeleton";
import {
  CheckSquare,
  Type,
  Hash,
  Calendar,
  Mail,
  Lock,
  Link as LinkIcon,
  FileText,
  List,
  AlertCircle,
} from "lucide-react";

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
  const { data: options, loading } = useFieldOptions(
    fieldName,
    fieldType,
    unwrappedSchema as z.ZodEnum<any>
  );

  useEffect(() => {
    if (!loading && options?.length) {
      const currentValue = form.getValues(fieldName);
      const exists = options.some((o: any) => o.value === currentValue);
      if (!exists) {
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

  const hasError = !!form.formState.errors[fieldName];
  const errorMessage = form.formState.errors[fieldName]?.message as string;

  // Shared input classes
  const inputClasses = cn(
    "w-full px-4 py-2.5 rounded-xl transition-all duration-200",
    "border-2 bg-white dark:bg-gray-800",
    "focus:outline-none focus:ring-2 focus:ring-offset-1",
    "disabled:opacity-50 disabled:cursor-not-allowed",
    hasError
      ? "border-danger/50 focus:border-danger focus:ring-danger/20"
      : "border-gray-200 dark:border-gray-700 focus:border-primary focus:ring-primary/20 hover:border-gray-300 dark:hover:border-gray-600"
  );

  const labelClasses = cn(
    "block text-sm font-semibold mb-2 flex items-center gap-2",
    hasError ? "text-danger" : "text-gray-700 dark:text-gray-200"
  );

  // ============================
  // Foreign Key Fields
  // ============================
  if (fieldType === "foreignkey" || fieldType === "foreignkey-array") {
    return (
      <ForeignKeyField
        key={fieldName}
        fieldName={fieldName}
        register={form.register}
        config={config}
        label={label}
        required={required}
        errors={form.formState.errors}
        form={form}
        setShowModal={setShowModal}
        fetchForginKey={fetchForginKey}
        setFetchForginKey={setFetchForginKey}
        isMulti={fieldType === "foreignkey-array"}
      />
    );
  }

  // ============================
  // Union Fields
  // ============================
  if (fieldType === "union") {
    return (
      <UnionField
        key={fieldName}
        fieldName={fieldName}
        fieldSchema={fieldSchema}
        register={form.register}
        config={config}
        label={label}
        required={required}
        errors={form.formState.errors}
      />
    );
  }

  // ============================
  // Checkbox Field
  // ============================
  if (template.wrapper === "checkbox") {
    return (
      <div key={fieldName} className="col-span-1">
        <div className="flex items-start gap-3 p-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-primary/50 transition-colors bg-gray-50/50 dark:bg-gray-800/50">
          <input
            id={fieldName}
            type="checkbox"
            {...form.register(fieldName)}
            className="mt-1 h-5 w-5 text-primary focus:ring-2 focus:ring-primary focus:ring-offset-2 border-gray-300 rounded transition-all cursor-pointer"
          />
          <div className="flex-1">
            <label
              htmlFor={fieldName}
              className="cursor-pointer text-sm font-medium text-gray-700 dark:text-gray-200 flex items-center gap-2"
            >
              <CheckSquare size={16} className="text-primary" />
              {label}
              {required && <span className="text-danger">*</span>}
            </label>
            {hasError && (
              <p className="mt-1 text-xs text-danger flex items-center gap-1">
                <AlertCircle size={12} />
                {errorMessage}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ============================
  // Select Field
  // ============================
  if (fieldType === "select") {
    return (
      <div key={fieldName} className="col-span-1 space-y-2">
        {label && (
          <label htmlFor={fieldName} className={labelClasses}>
            <Icon size={16} className="text-primary" />
            {label}
            {required && <span className="text-danger ml-1">*</span>}
          </label>
        )}

        <RHFSelect
          name={fieldName}
          control={form.control}
          parsedOptions={options}
          label={label}
          required={required}
          placeholder={t("selectValue") || "Select a value"}
          className="flex-1"
        />

        {hasError && (
          <p className="text-sm text-danger flex items-center gap-1.5 mt-1 animate-fade-in">
            <AlertCircle size={14} />
            {errorMessage}
          </p>
        )}
      </div>
    );
  }

  // ============================
  // Textarea Field
  // ============================
  if (fieldType === "textarea") {
    return (
      <div key={fieldName} className="col-span-1 md:col-span-2 space-y-2">
        <label htmlFor={fieldName} className={labelClasses}>
          <FileText size={16} className="text-primary" />
          {label}
          {required && <span className="text-danger ml-1">*</span>}
        </label>

        <div className="relative">
          <textarea
            id={fieldName}
            {...form.register(fieldName)}
            className={cn(inputClasses, "min-h-[120px] resize-y")}
            rows={template.props?.rows || 4}
            placeholder={`${t("enter")} ${label}...`}
            autoComplete="off"
          />
        </div>

        {hasError && (
          <p className="text-sm text-danger flex items-center gap-1.5 animate-fade-in">
            <AlertCircle size={14} />
            {errorMessage}
          </p>
        )}
      </div>
    );
  }

  // ============================
  // Array Field
  // ============================
  if (fieldType === "array") {
    return (
      <div key={fieldName} className="col-span-1 md:col-span-2 space-y-2">
        <label htmlFor={fieldName} className={labelClasses}>
          <List size={16} className="text-primary" />
          {label}
          {required && <span className="text-danger ml-1">*</span>}
        </label>

        <input
          id={fieldName}
          type="text"
          {...form.register(fieldName)}
          className={inputClasses}
          placeholder={t("commaSeparated") || "Value 1, Value 2, Value 3"}
          autoComplete="off"
        />

        <p className="text-xs text-secondary flex items-center gap-1">
          {t("enterCommaSeparated")}
        </p>

        {hasError && (
          <p className="text-sm text-danger flex items-center gap-1.5 animate-fade-in">
            <AlertCircle size={14} />
            {errorMessage}
          </p>
        )}
      </div>
    );
  }

  // ============================
  // Object Field
  // ============================
  if (fieldType === "object") {
    return (
      <div key={fieldName} className="col-span-1 md:col-span-2 space-y-2">
        <label htmlFor={fieldName} className={labelClasses}>
          <FileText size={16} className="text-primary" />
          {label}
          {required && <span className="text-danger ml-1">*</span>}
        </label>

        <input
          id={fieldName}
          type="text"
          {...form.register(fieldName)}
          className={inputClasses}
          autoComplete="off"
          placeholder='{"key": "value"}'
        />

        <p className="text-xs text-secondary">
          {t("enterValidJson") || "Enter a valid JSON object"}
        </p>

        {hasError && (
          <p className="text-sm text-danger flex items-center gap-1.5 animate-fade-in">
            <AlertCircle size={14} />
            {errorMessage}
          </p>
        )}
      </div>
    );
  }

  // ============================
  // Default Input Field
  // ============================
  const inputType = template.type || "text";
  const isDisabled =
    mode === "edit" && (fieldName === "username" || fieldName === "password");

  return (
    <div key={fieldName} className="col-span-1 space-y-2">
      <label htmlFor={fieldName} className={labelClasses}>
        <Icon size={16} className="text-primary" />
        {label}
        {required && <span className="text-danger ml-1">*</span>}
      </label>

      <div className="relative">
        <input
          id={fieldName}
          type={inputType}
          {...form.register(fieldName)}
          className={inputClasses}
          placeholder={`${t("enter")} ${label}...`}
          disabled={isDisabled}
          autoComplete="off"
          {...(template.props || {})}
        />
      </div>

      {hasError && (
        <p className="text-sm text-danger flex items-center gap-1.5 animate-fade-in">
          <AlertCircle size={14} />
          {errorMessage}
        </p>
      )}
    </div>
  );
};

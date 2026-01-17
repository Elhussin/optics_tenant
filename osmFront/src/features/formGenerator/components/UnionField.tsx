"use client";

import { z } from "zod";
import { unwrapSchema } from "../utils/unwrapSchema";
import { getUnionOptions } from "../utils/getUnionOptions";
import { UnionFieldProps } from "../types";
import { cn } from "@/src/shared/utils/cn";
import { List, AlertCircle, ChevronDown } from "lucide-react";

export function UnionField(props: UnionFieldProps) {
  const { fieldName, fieldSchema, register, config, label, required, errors } =
    props;
  const unwrappedSchema = unwrapSchema(fieldSchema);
  const options =
    unwrappedSchema instanceof z.ZodUnion
      ? getUnionOptions(unwrappedSchema)
      : [];

  const hasError = !!errors[fieldName];
  const errorMessage = errors[fieldName]?.message;

  const selectClasses = cn(
    "w-full px-4 py-2.5 pr-10 rounded-xl transition-all duration-200 appearance-none",
    "border-2 bg-white dark:bg-gray-800",
    "focus:outline-none focus:ring-2 focus:ring-offset-1",
    "disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer",
    hasError
      ? "border-danger/50 focus:border-danger focus:ring-danger/20"
      : "border-gray-200 dark:border-gray-700 focus:border-primary focus:ring-primary/20 hover:border-gray-300 dark:hover:border-gray-600"
  );

  const labelClasses = cn(
    "block text-sm font-semibold mb-2 flex items-center gap-2",
    hasError ? "text-danger" : "text-gray-700 dark:text-gray-200"
  );

  return (
    <div className="col-span-1 space-y-2">
      <label htmlFor={fieldName} className={labelClasses}>
        <List size={16} className="text-primary" />
        {label}
        {required && <span className="text-danger ml-1">*</span>}
      </label>

      <div className="relative">
        <select
          id={fieldName}
          {...register(fieldName)}
          className={selectClasses}
        >
          <option value="" className="text-gray-400">
            Select an option...
          </option>
          {options.map((option: string) => (
            <option
              key={option}
              value={option}
              className="text-gray-900 dark:text-gray-100"
            >
              {option}
            </option>
          ))}
        </select>

        {/* Custom Dropdown Icon */}
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <ChevronDown
            size={18}
            className={cn(
              "transition-colors",
              hasError ? "text-danger" : "text-gray-400"
            )}
          />
        </div>
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

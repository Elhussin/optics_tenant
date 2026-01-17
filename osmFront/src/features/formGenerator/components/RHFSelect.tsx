"use client";

import { Controller } from "react-hook-form";
import ReactSelect from "react-select";
import { RHFSelectProps } from "../types";
import customStyles from "@/src/shared/constants/customStyles";
import { AlertCircle } from "lucide-react";
import { cn } from "@/src/shared/utils/cn";

export const RHFSelect = (props: RHFSelectProps & { isMulti?: boolean }) => {
  const {
    name,
    control,
    parsedOptions,
    label,
    required = false,
    placeholder = "Select...",
    className = "",
    isMulti = false,
  } = props;

  return (
    <div className={cn("w-full", className)}>
      <Controller
        name={name as any}
        control={control}
        rules={{
          required: required ? `${label || name} is required` : false,
        }}
        render={({ field, fieldState }) => {
          const hasError = !!fieldState.error;

          return (
            <div className="space-y-2">
              <div
                className={cn(
                  "rounded-xl transition-all duration-200",
                  hasError && "ring-2 ring-danger/20"
                )}
              >
                <ReactSelect
                  inputId={name}
                  isMulti={isMulti}
                  options={parsedOptions}
                  onChange={(opt) => {
                    if (isMulti) {
                      field.onChange((opt as any[]).map((o) => o.value));
                    } else {
                      field.onChange((opt as any)?.value);
                    }
                  }}
                  onBlur={field.onBlur}
                  value={
                    isMulti
                      ? parsedOptions.filter((o) =>
                          Array.isArray(field.value)
                            ? field.value.includes(o.value)
                            : false
                        )
                      : parsedOptions.find((o) => o.value === field.value) ||
                        null
                  }
                  styles={customStyles}
                  placeholder={placeholder}
                  isClearable
                  className={cn(hasError && "react-select-error")}
                />
              </div>

              {hasError && (
                <p className="text-sm text-danger flex items-center gap-1.5 animate-fade-in">
                  <AlertCircle size={14} />
                  {fieldState.error.message}
                </p>
              )}
            </div>
          );
        }}
      />
    </div>
  );
};

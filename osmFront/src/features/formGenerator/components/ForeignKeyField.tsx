"use client";

import { relationshipConfigs } from "@/src/features/formGenerator/constants/generatFormConfig";
import { useEffect, useRef } from "react";
import { ActionButton } from "@/src/shared/components/ui/buttons";
import { Plus, Link as LinkIcon } from "lucide-react";
import { RHFSelect } from "./RHFSelect";
import { ForeignKeyFieldProps } from "../types";
import { useFilteredListRequest } from "@/src/shared/hooks/useFilteredListRequest";
import { formsConfig } from "@/src/features/formGenerator/constants/entityConfig";
import { cn } from "@/src/shared/utils/cn";

export function ForeignKeyField(
  props: ForeignKeyFieldProps & { isMulti?: boolean }
) {
  const {
    fieldName,
    config,
    label,
    required,
    form,
    setShowModal,
    fetchForginKey,
    setFetchForginKey,
    isMulti,
  } = props;

  const relationConfig = relationshipConfigs[fieldName];
  const alias = formsConfig[relationConfig?.entityName]?.listAlias;

  const { data, refetch } = useFilteredListRequest({
    alias: alias!,
    defaultPage: 1,
    defaultPageSize: 1000,
    defaultAll: true,
  });

  const parsedOptions = data.map((item: any) => ({
    value: item?.[relationConfig?.valueField],
    label: item?.[relationConfig?.labelField],
  }));

  const expectingUpdate = useRef(false);

  useEffect(() => {
    if (fetchForginKey) {
      expectingUpdate.current = true;
      refetch();
      setFetchForginKey(false);
    }
  }, [fetchForginKey, refetch, setFetchForginKey]);

  useEffect(() => {
    if (expectingUpdate.current && data?.length > 0 && relationConfig) {
      const lastItem = data[data.length - 1];
      if (lastItem) {
        form.setValue(fieldName, lastItem[relationConfig.valueField]);
      }
      expectingUpdate.current = false;
    }
  }, [data, fieldName, relationConfig, form]);

  if (!relationConfig) return null;

  const hasError = !!form.formState.errors[fieldName];

  return (
    <div className="col-span-1 space-y-2">
      {label && (
        <label
          htmlFor={fieldName}
          className={cn(
            "text-sm font-semibold mb-2 flex items-center gap-2",
            hasError ? "text-danger" : "text-gray-700 dark:text-gray-200"
          )}
        >
          <LinkIcon size={16} className="text-primary" />
          {label}
          {required && <span className="text-danger ml-1">*</span>}
        </label>
      )}

      <div className="flex items-start gap-2">
        {/* Select Field */}
        <div className="flex-1">
          <RHFSelect
            name={fieldName}
            control={form.control}
            parsedOptions={parsedOptions}
            label={label}
            required={required}
            placeholder="Select..."
            isMulti={isMulti}
          />
        </div>

        {/* Add New Button */}
        <ActionButton
          onClick={() => setShowModal(true)}
          variant="icon-success"
          size="sm"
          icon={<Plus size={18} />}
          title="Add New"
          className="rounded-xl mt-0.5 shrink-0"
        />
      </div>
    </div>
  );
}

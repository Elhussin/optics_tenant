import { z } from "zod";
import { useFilteredListRequest } from "@/src/shared/hooks/useFilteredListRequest";
import { formsConfig } from "@/src/shared/constants/formsConfig";
import { relationshipConfigs } from "@/src/features/formGenerator/constants/generatFormConfig";

export function useFieldOptions(
  fieldName: string,
  fieldType: string,
  schema?: z.ZodEnum<any>,
) {
  // Determine if this is a foreign key field
  const isForeignKey = fieldType === "foreignkey" || fieldType === "foreignkey-array";
  const relationConfig = relationshipConfigs[fieldName];
  const alias =
    isForeignKey && relationConfig
      ? formsConfig[relationConfig.entityName]?.listAlias
      : null;

  // Condition to run query
  // Only enable if it is a foreign key AND has a valid alias
  const enabled = !!alias && isForeignKey;

  // Call hook unconditionally
  const { data, isLoading, refetch } = useFilteredListRequest({
    alias: alias || "", // Pass empty string if null, enabled=false prevents execution
    defaultPage: 1,
    defaultPageSize: 1000,
    defaultAll: true,
    enabled,
  });

  // Handle Enum / Select
  if ((fieldType === "select" || fieldType === "union") && schema) {
    return {
      data: schema.options.map((opt: any) => {
        if (opt instanceof z.ZodLiteral) {
          return { label: String(opt.value), value: opt.value };
        }
        return { label: opt, value: opt };
      }),
      loading: false,
      refetch: async () => { }, // No-op for static data
      rawData: [],
    };
  }

  // Handle Foreign Key
  if (isForeignKey) {
    if (!relationConfig || !alias) {
      console.warn(`Missing relationship config for field: ${fieldName}`);
      return { data: [], loading: false, refetch: async () => { }, rawData: [] };
    }

    const formattedData = (data || []).map((item: any) => ({
      value: item?.[relationConfig!.valueField],
      label:
        item?.[relationConfig!.labelField] ||
        (relationConfig!.searchField
          ? item?.[relationConfig!.searchField]
          : "Unknown"),
      // Keep original item for reference if needed
      original: item,
    }));

    return {
      data: formattedData,
      loading: isLoading,
      refetch,
      rawData: data || [],
      relationConfig, // Return config for usage in RenderField
    };
  }

  return { data: [], loading: false, refetch: async () => { }, rawData: [] };
}

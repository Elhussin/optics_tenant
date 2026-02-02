import { z } from "zod";
import { useFilteredListRequest } from "@/src/shared/hooks/useFilteredListRequest";
import { formsConfig } from "@/src/shared/constants/entityConfig";
import { relationshipConfigs } from "@/src/features/formGenerator/constants/generatFormConfig";

export function useFieldOptions(fieldName: string, fieldType: string, schema?: z.ZodEnum<any>) {
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
  if (fieldType === "foreignkey" || fieldType === "foreignkey-array") {
    const relationConfig = relationshipConfigs[fieldName];
    const alias = relationConfig ? formsConfig[relationConfig.entityName]?.listAlias : null;

    // TODO: Verify if we need to filter by tenant or other context? 
    // Usually useFilteredListRequest handles defaults.

    // Condition to run query
    const enabled = !!alias;

    const { data, isLoading, refetch } = useFilteredListRequest({
      alias: alias!,
      defaultPage: 1,
      defaultPageSize: 1000,
      defaultAll: true,
      enabled,
    });

    if (!relationConfig || !alias) {
      console.warn(`Missing relationship config for field: ${fieldName}`);
      return { data: [], loading: false, refetch: async () => { }, rawData: [] };
    }

    const formattedData = (data || []).map((item: any) => ({
      value: item?.[relationConfig!.valueField],
      label: item?.[relationConfig!.labelField] || (relationConfig!.searchField ? item?.[relationConfig!.searchField] : "Unknown"),
      // Keep original item for reference if needed
      original: item
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

import { parsedOptions } from "@/src/features/products/utils/parsedOptions"
import { selectRelatedData } from "@/src/features/products/utils/selectRelatedData"

export const filterData = (
  data: any,
  item: any,
  selectedType: any,
) => {
  const filterField = item.filter;
  const selectedData = selectRelatedData(data, filterField);
  let filteredData = selectedData;

  // Apply subFilter logic if defined in config
  if (item.subFilter && selectedType) {
    // Check if using prefix-based filtering
    if (item.subFilterType === "prefix") {
      console.log("prefix", selectedType);
      // Filter by prefix: value starts with selectedType (e.g., "FR-SG" starts with "FR")
      filteredData = selectedData?.filter((v: any) => {
        const value = v[item.subFilter] || v.value || "";
        return value.toString().startsWith(selectedType);
      });
    } else {
      // Default: exact match or "All"
      // Example: item.subFilter = "product_type", selectedType = "FR"
      // We want brands where brand.product_type == "FR" or "All"
      filteredData = selectedData?.filter(
        (v: any) => v[item.subFilter] === selectedType || v[item.subFilter] === "All"
      );
    }
  }

  return parsedOptions(filteredData, item);
};
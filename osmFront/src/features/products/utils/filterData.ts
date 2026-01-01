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
    // Example: item.subFilter = "product_type", selectedType = "FR"
    // We want brands where brand.product_type == "FR" or "All"
    if (item.subFilter && selectedType) {
      filteredData = selectedData?.filter(
        (v: any) => v[item.subFilter] === selectedType || v[item.subFilter] === "All"
      );
    }

    return parsedOptions(filteredData, item);
  };
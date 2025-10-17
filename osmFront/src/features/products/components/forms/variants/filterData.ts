import { parsedOptions } from "@/src/features/product/utils/parsedOptions"
import { selectRelatedData } from "@/src/features/product/utils/selectRelatedData"

export const filterData = (
    data: any,
    item: any,
    selectedType: any,
    subField?: string,
    subFilter?: string
  ) => {
    const filterField = item.filter;
    const selectedData = selectRelatedData(data, filterField);
    let filteredData = selectedData;
    console.log("data",data)
    if (subField && subFilter && filterField === subField) {
      filteredData = selectedData?.filter(
        (v: any) => v[subFilter] === selectedType || v[subFilter] === "All"
      );
    }

    return parsedOptions(filteredData, item);
  };
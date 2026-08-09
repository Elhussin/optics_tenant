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

  // Category dependent filtering based on selected main_group (e.g. FR, SL, CL)
  if (filterField === "categories" && selectedType) {
    filteredData = selectedData?.filter((cat: any) => {
      if (!cat) return false;
      if (cat.main_group) {
        return cat.main_group === selectedType || cat.main_group === "all";
      }
      return true;
    });
  }

  // Apply subFilter logic if defined in config
  if (item.subFilter && selectedType) {
    if (item.subFilterType === "prefix") {
      filteredData = selectedData?.filter((v: any) => {
        const value = v[item.subFilter] || v.value || "";
        return value.toString().startsWith(selectedType);
      });
    } else {
      filteredData = selectedData?.filter(
        (v: any) =>
          !v[item.subFilter] ||
          v[item.subFilter] === selectedType ||
          v[item.subFilter] === "All" ||
          v[item.subFilter] === "all"
      );
    }
  }


  return parsedOptions(filteredData, item);
};
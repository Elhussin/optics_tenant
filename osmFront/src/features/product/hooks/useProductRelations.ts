import { useFilteredListRequest } from "@/src/shared/hooks/useFilteredListRequest";

export function useProductRelations() {
    const fetchAttributes = useFilteredListRequest({ alias: "products_attribute_values_list", defaultPage: 1, defaultAll: true, defaultPageSize: 1000 });
    const fetchSuppliers = useFilteredListRequest({ alias: "products_suppliers_list", defaultPage: 1, defaultAll: true, defaultPageSize: 1000 });
    const fetchManufacturers = useFilteredListRequest({ alias: "products_manufacturers_list", defaultPage: 1, defaultAll: true, defaultPageSize: 1000 });
    const fetchBrands = useFilteredListRequest({ alias: "products_brands_list", defaultPage: 1, defaultAll: true, defaultPageSize: 1000 });
    const category = useFilteredListRequest({ alias: "products_categories_list", defaultPage: 1, defaultAll: true, defaultPageSize: 1000 });
  
    const isLoading =
      fetchAttributes.isLoading ||
      fetchSuppliers.isLoading ||
      fetchManufacturers.isLoading ||
      fetchBrands.isLoading ||
      category.isLoading;
  
    const data = {
      attributes: fetchAttributes.data || [],
      suppliers: fetchSuppliers.data || [],
      manufacturers: fetchManufacturers.data || [],
      brands: fetchBrands.data || [],
      categories: category.data || [],
    };
  
    return { data, isLoading };
  }
  
  
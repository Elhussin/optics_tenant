"use client";

import { useFilteredListRequest } from "@/src/shared/hooks/useFilteredListRequest";
import { useProductFormStore } from "../store/useProductFormStore";
import { useEffect } from "react";

export function useProductRelations() {
  // TODO: For scalability, consider fetching attribute values lazily or by type
  // instead of fetching all at once ('defaultAll: true').
  const fetchAttributes = useFilteredListRequest({
    alias: "products_attribute_values_list",
    defaultPage: 1,
    defaultAll: true,
  });

  const fetchSuppliers = useFilteredListRequest({
    alias: "products_suppliers_list",
    defaultPage: 1,
    defaultAll: true,
  });

  const fetchManufacturers = useFilteredListRequest({
    alias: "products_manufacturers_list",
    defaultPage: 1,
    defaultAll: true,
  });

  const fetchBrands = useFilteredListRequest({
    alias: "products_brands_list",
    defaultPage: 1,
    defaultAll: true,
  });

  const fetchCategories = useFilteredListRequest({
    alias: "products_categories_list",
    defaultPage: 1,
    defaultAll: true,
  });

  const fetchAttributesDefinitions = useFilteredListRequest({
    alias: "products_attributes_list",
    defaultPage: 1,
    defaultAll: true,
  });

  const { setData } = useProductFormStore();

  // Helper to sync data only when fetched
  const syncData = (key: string, data: any[]) => {
    if (data && data.length > 0) {
      setData(key, data);
    }
  };

  useEffect(() => {
    syncData("attribute-values", fetchAttributes.data || []);
  }, [fetchAttributes.data]);

  useEffect(() => {
    syncData("attributes", fetchAttributesDefinitions.data || []);
  }, [fetchAttributesDefinitions.data]);

  useEffect(() => {
    syncData("suppliers", fetchSuppliers.data || []);
  }, [fetchSuppliers.data]);

  useEffect(() => {
    syncData("manufacturers", fetchManufacturers.data || []);
  }, [fetchManufacturers.data]);

  useEffect(() => {
    syncData("brands", fetchBrands.data || []);
  }, [fetchBrands.data]);

  useEffect(() => {
    syncData("categories", fetchCategories.data || []);
  }, [fetchCategories.data]);

  const isLoading =
    fetchAttributes.isLoading ||
    fetchAttributesDefinitions.isLoading ||
    fetchSuppliers.isLoading ||
    fetchManufacturers.isLoading ||
    fetchBrands.isLoading ||
    fetchCategories.isLoading;

  return { isLoading };
}

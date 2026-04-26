"use client";

import React, { useState, useMemo, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Filter, Package, X, ChevronsUpDown, Check } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import api from "@/src/shared/api/axios";
import { extractArrayData } from "@/src/shared/utils/apiHelpers";
import { Button } from "@/src/shared/components/shadcn/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/src/shared/components/shadcn/ui/popover";
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/src/shared/components/shadcn/ui/command";
import { cn } from "@/src/shared/utils/cn";
import { formsConfig } from "@/src/shared/constants/formsConfig";

interface ProductVariant {
  id: number;
  sku: string;
  product: { id: number; name: string };
  product_name?: string;
  selling_price: number;
  brand_name?: string;
  category_name?: string;
}

interface FilterOption {
  value: string | number;
  label: string;
}

interface FilterOptions {
  brands?: FilterOption[];
  categories?: FilterOption[];
  suppliers?: FilterOption[];
}

interface ProductVariantSelectProps {
  value: number | null;
  onChange: (variantId: number | null, variantData?: ProductVariant) => void;
  branchId?: number | null;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function ProductVariantSelect({
  value,
  onChange,
  branchId,
  placeholder,
  disabled = false,
  className,
}: ProductVariantSelectProps) {
  const t = useTranslations("inventory");
  const [open, setOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Filter states
  const [brandFilter, setBrandFilter] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [supplierFilter, setSupplierFilter] = useState<string>("");

  // Fetch filter options
  const { data: filterOptions } = useQuery<FilterOptions>({
    queryKey: [
      formsConfig["product-variants"]?.filterAlias ||
        "products_variants_filter_options_retrieve"
    ],
    queryFn: async () => {
      const response = await api.customRequest(
        formsConfig["product-variants"]?.filterAlias ||
          "products_variants_filter_options_retrieve",
        {},
      );
      return response;
    },
    refetchOnWindowFocus: false,
  });

  // Build query params based on filters
  const queryParams = useMemo(() => {
    const params: Record<string, any> = {};
    if (brandFilter) params.brand = brandFilter;
    if (categoryFilter) params.category = categoryFilter;
    if (supplierFilter) params.supplier = supplierFilter;
    return params;
  }, [brandFilter, categoryFilter, supplierFilter]);

  const hasActiveFilters = brandFilter || categoryFilter || supplierFilter;

  // Fetch variants with filters
  const { data: variantsData, isLoading } = useQuery({
    queryKey: ["products_variants_list", queryParams],
    queryFn: async () => {
      const response = await api.customRequest(
        "products_variants_list",
        queryParams,
      );
      return extractArrayData<ProductVariant>(response);
    },
    refetchOnWindowFocus: false,
  });

  const variants = variantsData || [];

  // Get selected variant data
  const selectedVariant = useMemo(() => {
    return variants.find((v) => v.id === value);
  }, [variants, value]);

  const handleSelect = useCallback(
    (variant: ProductVariant) => {
      onChange(variant.id, variant);
      setOpen(false);
    },
    [onChange],
  );

  const clearFilters = () => {
    setBrandFilter("");
    setCategoryFilter("");
    setSupplierFilter("");
  };

  const brands = filterOptions?.brands || [];
  const categories = filterOptions?.categories || [];
  const suppliers = filterOptions?.suppliers || [];

  return (
    <div className={cn("space-y-2", className)}>
      {/* Filter Toggle */}
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
          className={cn(
            "gap-2 text-xs",
            hasActiveFilters && "border-primary text-primary",
          )}
        >
          <Filter size={14} />
          {t("transfers.filters.title") || "Filters"}
          {hasActiveFilters && (
            <span className="bg-primary text-white px-1.5 rounded-full text-xs">
              {
                [brandFilter, categoryFilter, supplierFilter].filter(Boolean)
                  .length
              }
            </span>
          )}
        </Button>
        {hasActiveFilters && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="gap-1 text-xs text-secondary hover:text-destructive"
          >
            <X size={14} />
            {t("filters.clear") || "Clear"}
          </Button>
        )}
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="p-4 bg-body/50 rounded-xl border border-main/10 space-y-3 animate-in slide-in-from-top-2">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Brand Filter */}
            <div>
              <label className="block text-xs font-medium text-secondary mb-1.5">
                {t("transfers.filters.brand") || "Brand"}
              </label>
              <select
                value={brandFilter}
                onChange={(e) => setBrandFilter(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-main/20 bg-surface text-sm
                  focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              >
                <option value="">{t("transfers.filters.all") || "All"}</option>
                {brands.map((b: FilterOption) => (
                  <option key={b.value} value={b.value}>
                    {b.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-xs font-medium text-secondary mb-1.5">
                {t("transfers.filters.category") || "Category"}
              </label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-main/20 bg-surface text-sm
                  focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              >
                <option value="">{t("transfers.filters.all") || "All"}</option>
                {categories.map((c: FilterOption) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Supplier Filter */}
            <div>
              <label className="block text-xs font-medium text-secondary mb-1.5">
                {t("transfers.filters.supplier") || "Supplier"}
              </label>
              <select
                value={supplierFilter}
                onChange={(e) => setSupplierFilter(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-main/20 bg-surface text-sm
                  focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              >
                <option value="">{t("transfers.filters.all") || "All"}</option>
                {suppliers.map((s: FilterOption) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Searchable Select */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            disabled={disabled}
            className={cn(
              "w-full justify-between h-12 px-4 font-normal rounded-xl transition-all duration-300",
              "bg-surface border border-main/20 hover:border-primary/50",
              open && "border-primary ring-2 ring-primary/20",
              disabled && "opacity-50 cursor-not-allowed",
            )}
          >
            {selectedVariant ? (
              <div className="flex items-center gap-2 text-start">
                <Package size={16} className="text-primary shrink-0" />
                <div className="truncate">
                  <span className="font-medium">
                    {selectedVariant.product?.name ||
                      selectedVariant.product_name}
                  </span>
                  <span className="text-secondary text-sm mr-2">
                    - {selectedVariant.sku}
                  </span>
                </div>
              </div>
            ) : (
              <span className="text-secondary">
                {placeholder || t("select.product") || "Select product..."}
              </span>
            )}
            <ChevronsUpDown
              className={cn(
                "ml-2 h-4 w-4 shrink-0 opacity-50 transition-transform",
                open && "rotate-180",
              )}
            />
          </Button>
        </PopoverTrigger>

        <PopoverContent
          className="w-[400px] p-0 border border-main/20 bg-surface shadow-xl"
          align="start"
        >
          <Command className=" bg-surface">
            <CommandInput
              placeholder={t("search.product") || "Search products..."}
              className="h-11 px-4 border-b border-main/10"
            />
            <CommandList className="max-h-80 overflow-auto">
              {isLoading ? (
                <div className="py-6 text-center text-secondary">
                  <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2" />
                  {t("common.loading") || "Loading..."}
                </div>
              ) : (
                <>
                  <CommandEmpty className="py-6 text-center text-secondary">
                    {t("search.noResults") || "No products found."}
                  </CommandEmpty>
                  <CommandGroup>
                    {variants.map((variant) => {
                      const isSelected = value === variant.id;
                      return (
                        <CommandItem
                          key={variant.id}
                          value={`${variant.product?.name || ""} ${
                            variant.sku
                          }`}
                          onSelect={() => handleSelect(variant)}
                          className={cn(
                            "cursor-pointer bg-surface px-4 py-3 transition-colors hover:bg-primary/5",
                            isSelected && "bg-primary/10",
                          )}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4 transition-all",
                              isSelected
                                ? "opacity-100 text-primary"
                                : "opacity-0",
                            )}
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span
                                className={cn(
                                  "font-medium",
                                  isSelected && "text-primary",
                                )}
                              >
                                {variant.product?.name || variant.product_name}
                              </span>
                              {variant.brand_name && (
                                <span className="text-xs px-1.5 py-0.5 bg-blue-100 text-blue-600 rounded">
                                  {variant.brand_name}
                                </span>
                              )}
                            </div>
                            <div className="text-sm text-secondary flex items-center gap-2">
                              <span>SKU: {variant.sku}</span>
                              {variant.selling_price && (
                                <span className="text-primary font-medium">
                                  {Number(variant.selling_price).toFixed(2)}
                                </span>
                              )}
                            </div>
                          </div>
                        </CommandItem>
                      );
                    })}
                  </CommandGroup>
                </>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}

export default ProductVariantSelect;

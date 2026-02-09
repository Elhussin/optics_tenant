"use client";

import React, { useState, useEffect } from "react";
import { Package, Search, Plus, Trash2, Edit } from "lucide-react";
import { Input } from "@/src/shared/components/shadcn/ui/input";
import { Label } from "@/src/shared/components/shadcn/ui/label";
import { Button } from "@/src/shared/components/shadcn/ui/button";
import { Card, CardContent } from "@/src/shared/components/shadcn/ui/card";
import { useApiForm } from "@/src/shared/hooks/useApiForm";
import { useOrderFormStore } from "../../store/useOrderFormStore";
import { OrderItem } from "../../types";
import { SectionLoading } from "@/src/shared/components/ui/Spinner";

export function ProductsStep() {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editQuantity, setEditQuantity] = useState(1);
  const [editPrice, setEditPrice] = useState(0);
  const store = useOrderFormStore();

  // Fetch Flexible Prices if Partner is selected
  const { query: pricingQuery } = useApiForm({
    alias: "products_flexible_prices_list",
    defaultValues: {
      partner: store.partnerId,
      page_size: 1000, // optimize this later
    },
    enabled: !!store.partnerId,
  });

  const flexiblePricesMap = React.useMemo(() => {
    const map = new Map<number, number>();
    if (pricingQuery.data?.results) {
      pricingQuery.data.results.forEach((fp: any) => {
        map.set(fp.variant, parseFloat(fp.special_price));
      });
    }
    return map;
  }, [pricingQuery.data]);

  // Search products/variants
  const { query, isBusy } = useApiForm({
    alias: "products_variants_list",
    defaultValues: { search: searchTerm, page_size: 10 },
    enabled: searchTerm.length >= 2,
  });

  useEffect(() => {
    if (searchTerm.length >= 2) {
      query.refetch();
    } else {
      setSearchResults([]);
    }
  }, [searchTerm]);

  useEffect(() => {
    if (query.data?.results) {
      setSearchResults(query.data.results);
    }
  }, [query.data]);

  const getPrice = (variant: any) => {
    if (store.partnerId && flexiblePricesMap.has(variant.id)) {
      return (
        flexiblePricesMap.get(variant.id) || parseFloat(variant.selling_price)
      );
    }
    return parseFloat(variant.selling_price);
  };

  const handleAddProduct = (variant: any) => {
    const price = getPrice(variant);
    const newItem: OrderItem = {
      product_variant: variant.id,
      product_name: `${variant.product_model || variant.sku} - ${variant.sku}`,
      quantity: 1,
      unit_price: price || 0,
      prescription: store.prescriptionId,
    };
    store.addItem(newItem);
    setSearchTerm("");
    setSearchResults([]);
  };

  const handleUpdateItem = (index: number) => {
    store.updateItem(index, {
      quantity: editQuantity,
      unit_price: editPrice,
    });
    setEditingIndex(null);
  };

  const startEditing = (index: number) => {
    const item = store.items[index];
    setEditQuantity(item.quantity);
    setEditPrice(item.unit_price);
    setEditingIndex(index);
  };

  return (
    <div className="space-y-6">
      {/* Search Products */}
      <div className="space-y-4">
        <Label className="text-lg font-semibold flex items-center gap-2">
          <Search size={20} />
          البحث عن المنتجات
        </Label>

        <div className="relative">
          <Search
            size={18}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <Input
            type="text"
            placeholder="ابحث بالاسم أو SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pr-10"
          />

          {/* Search Results Dropdown */}
          {searchTerm.length >= 2 && (
            <div className="absolute z-10 w-full mt-1 bg-elevated rounded-lg shadow-lg border max-h-72 overflow-y-auto">
              {isBusy ? (
                <div className="p-4">
                  <SectionLoading height="h-32" />
                </div>
              ) : searchResults.length > 0 ? (
                searchResults.map((variant) => {
                  const price = getPrice(variant);
                  const originalPrice = parseFloat(variant.selling_price);
                  const hasSpecialPrice = price !== originalPrice;

                  return (
                    <div
                      key={variant.id}
                      className="px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-800 border-b last:border-0 flex items-center justify-between"
                    >
                      <div>
                        <p className="font-medium">
                          {variant.product_model || variant.sku}
                        </p>
                        <p className="text-sm text-secondary flex gap-2 items-center">
                          <span>SKU: {variant.sku}</span>
                          <span>|</span>
                          {hasSpecialPrice ? (
                            <>
                              <span className="line-through text-gray-400">
                                {originalPrice} ر.س
                              </span>
                              <span className="text-green-600 font-bold">
                                {price} ر.س
                              </span>
                            </>
                          ) : (
                            <span>السعر: {price} ر.س</span>
                          )}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleAddProduct(variant)}
                        className="bg-primary hover:bg-primary/90"
                      >
                        <Plus size={16} className="ml-1" />
                        إضافة
                      </Button>
                    </div>
                  );
                })
              ) : (
                <p className="p-4 text-center text-secondary">لا توجد نتائج</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Added Items */}
      <div className="space-y-4">
        <Label className="text-lg font-semibold flex items-center gap-2">
          <Package size={20} />
          المنتجات المضافة ({store.items.length})
        </Label>

        {store.items.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
            <Package size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-secondary">لم يتم إضافة منتجات بعد</p>
            <p className="text-sm text-secondary mt-2">
              ابحث عن المنتجات وأضفها للطلب
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {store.items.map((item, index) => (
              <Card key={index} className="overflow-hidden">
                <CardContent className="py-4">
                  {editingIndex === index ? (
                    // Edit Mode
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <p className="font-medium">{item?.product_name}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>الكمية</Label>
                          <Input
                            type="number"
                            min="1"
                            value={editQuantity}
                            onChange={(e) =>
                              setEditQuantity(parseInt(e.target.value) || 1)
                            }
                          />
                        </div>
                        <div>
                          <Label>السعر</Label>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={editPrice}
                            onChange={(e) =>
                              setEditPrice(parseFloat(e.target.value) || 0)
                            }
                          />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleUpdateItem(index)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          حفظ
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingIndex(null)}
                        >
                          إلغاء
                        </Button>
                      </div>
                    </div>
                  ) : (
                    // View Mode
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-medium">{item.product_name}</p>
                        <div className="flex gap-4 text-sm text-secondary mt-1">
                          <span>الكمية: {item.quantity}</span>
                          <span>السعر: {item.unit_price.toFixed(2)} ر.س</span>
                          <span className="font-medium text-primary">
                            الإجمالي:{" "}
                            {(item.quantity * item.unit_price).toFixed(2)} ر.س
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => startEditing(index)}
                        >
                          <Edit size={16} />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-red-500 hover:text-red-700"
                          onClick={() => store.removeItem(index)}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

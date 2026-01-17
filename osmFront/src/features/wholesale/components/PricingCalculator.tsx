// features/wholesale/components/PricingCalculator.tsx
/**
 * حاسبة أسعار الجملة
 */

"use client";

import React, { useState, useEffect } from "react";
import {
  Calculator,
  Package,
  Plus,
  Trash2,
  Search,
  Loader2,
  Tag,
  Percent,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/src/shared/components/shadcn/ui/card";
import { Button } from "@/src/shared/components/shadcn/ui/button";
import { Input } from "@/src/shared/components/shadcn/ui/input";
import { useWholesalePricing } from "../hooks/useWholesale";
import type {
  WholesalePricingItem,
  WholesaleCustomer,
} from "../types/wholesale.types";

interface PricingCalculatorProps {
  customer: WholesaleCustomer | null;
  onPricingChange?: (pricing: any) => void;
}

interface OrderItem {
  variant_id: number;
  variant_name: string;
  quantity: number;
  price?: string;
}

export function PricingCalculator({
  customer,
  onPricingChange,
}: PricingCalculatorProps) {
  const [items, setItems] = useState<OrderItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);

  const { pricing, loading, error, calculatePricing, reset } =
    useWholesalePricing();

  // Search for products
  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    try {
      // Use mobile search API for quick results
      const response = await fetch(
        `/api/mobile/products/search/?q=${encodeURIComponent(query)}&limit=10`
      );
      const data = await response.json();
      setSearchResults(data);
    } catch (err) {
      console.error("Search error:", err);
    } finally {
      setSearching(false);
    }
  };

  // Add item to order
  const addItem = (product: any) => {
    const exists = items.find((i) => i.variant_id === product.id);
    if (exists) {
      setItems((prev) =>
        prev.map((i) =>
          i.variant_id === product.id ? { ...i, quantity: i.quantity + 1 } : i
        )
      );
    } else {
      setItems((prev) => [
        ...prev,
        {
          variant_id: product.id,
          variant_name: product.name || product.sku,
          quantity: 1,
          price: product.price,
        },
      ]);
    }
    setSearchQuery("");
    setSearchResults([]);
  };

  // Update quantity
  const updateQuantity = (variantId: number, quantity: number) => {
    if (quantity < 1) {
      removeItem(variantId);
      return;
    }
    setItems((prev) =>
      prev.map((i) => (i.variant_id === variantId ? { ...i, quantity } : i))
    );
  };

  // Remove item
  const removeItem = (variantId: number) => {
    setItems((prev) => prev.filter((i) => i.variant_id !== variantId));
  };

  // Calculate pricing when items change
  useEffect(() => {
    if (customer && items.length > 0) {
      const itemsPayload = items.map((i) => ({
        variant_id: i.variant_id,
        quantity: i.quantity,
      }));
      calculatePricing(customer.id, itemsPayload);
    } else {
      reset();
    }
  }, [customer, items, calculatePricing, reset]);

  // Notify parent of pricing change
  useEffect(() => {
    if (onPricingChange) {
      onPricingChange(pricing);
    }
  }, [pricing, onPricingChange]);

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="w-5 h-5 text-primary" />
          حاسبة الأسعار
        </CardTitle>
        <CardDescription>
          أضف المنتجات لحساب السعر حسب مستوى العميل
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Product Search */}
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="ابحث عن منتج..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="pr-10"
            disabled={!customer}
          />

          {/* Search Results Dropdown */}
          {searchResults.length > 0 && (
            <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border rounded-lg shadow-lg max-h-60 overflow-auto">
              {searchResults.map((product) => (
                <button
                  key={product.id}
                  onClick={() => addItem(product)}
                  className="w-full px-4 py-2 text-right hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-between gap-2"
                >
                  <div>
                    <div className="font-medium">{product.name}</div>
                    <div className="text-xs text-gray-500">{product.sku}</div>
                  </div>
                  <div className="text-sm font-semibold text-primary">
                    {product.price} ر.س
                  </div>
                </button>
              ))}
            </div>
          )}

          {searching && (
            <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border rounded-lg shadow-lg p-4 flex items-center justify-center">
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
            </div>
          )}
        </div>

        {/* No Customer Warning */}
        {!customer && (
          <div className="text-center py-6 text-gray-500">
            <Package className="w-12 h-12 mx-auto mb-2 opacity-30" />
            <p>اختر عميلاً أولاً لحساب الأسعار</p>
          </div>
        )}

        {/* Items List */}
        {items.length > 0 && (
          <div className="space-y-2">
            {items.map((item) => {
              const pricedItem = pricing?.items.find(
                (p: WholesalePricingItem) => p.variant_id === item.variant_id
              );

              return (
                <div
                  key={item.variant_id}
                  className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="font-medium text-sm">
                      {item.variant_name}
                    </div>
                    {pricedItem && (
                      <div className="flex items-center gap-2 text-xs mt-1">
                        {pricedItem.discount_type !== "none" && (
                          <>
                            <span className="line-through text-gray-400">
                              {pricedItem.original_price}
                            </span>
                            <Tag className="w-3 h-3 text-green-500" />
                          </>
                        )}
                        <span className="text-primary font-semibold">
                          {pricedItem.unit_price} ر.س
                        </span>
                        {pricedItem.discount_type !== "none" && (
                          <span className="text-green-600 bg-green-100 px-1.5 py-0.5 rounded text-xs">
                            {pricedItem.discount_source}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 w-8 p-0"
                      onClick={() =>
                        updateQuantity(item.variant_id, item.quantity - 1)
                      }
                    >
                      -
                    </Button>
                    <Input
                      type="number"
                      value={item.quantity}
                      onChange={(e) =>
                        updateQuantity(
                          item.variant_id,
                          parseInt(e.target.value) || 0
                        )
                      }
                      className="w-16 h-8 text-center"
                      min={1}
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 w-8 p-0"
                      onClick={() =>
                        updateQuantity(item.variant_id, item.quantity + 1)
                      }
                    >
                      +
                    </Button>
                  </div>

                  {/* Line Total */}
                  <div className="text-sm font-bold w-24 text-left">
                    {pricedItem ? `${pricedItem.line_total} ر.س` : "-"}
                  </div>

                  {/* Remove */}
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                    onClick={() => removeItem(item.variant_id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              );
            })}
          </div>
        )}

        {/* Pricing Summary */}
        {pricing && (
          <div className="mt-6 pt-4 border-t space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">المجموع الفرعي</span>
              <span>{pricing.subtotal} ر.س</span>
            </div>
            {parseFloat(pricing.line_discounts) > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span className="flex items-center gap-1">
                  <Percent className="w-3 h-3" />
                  خصم مستوى التسعير
                </span>
                <span>-{pricing.line_discounts} ر.س</span>
              </div>
            )}
            {parseFloat(pricing.customer_discount) > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span>خصم العميل</span>
                <span>-{pricing.customer_discount} ر.س</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-bold pt-2 border-t">
              <span>الإجمالي</span>
              <span className="text-primary">{pricing.final_total} ر.س</span>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            <span className="mr-2 text-sm text-gray-500">
              جاري حساب الأسعار...
            </span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">
            {error}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default PricingCalculator;

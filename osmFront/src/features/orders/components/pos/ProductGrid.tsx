import React, { useState } from "react";
import { usePOSStore } from "../../store/usePOSStore";
import { Input } from "@/src/shared/components/shadcn/ui/input";
import { Search, Glasses, Eye, Activity, Package } from "lucide-react";
import { Button } from "@/src/shared/components/shadcn/ui/button";
import { useApiForm } from "@/src/shared/hooks/useApiForm";

// Mock categories for now - can be dynamic
const CATEGORIES = [
  { id: "all", label: "الكل" },
  { id: "FR", label: "إطارات", icon: <Glasses size={16} /> },
  { id: "SL", label: "عدسات", icon: <Eye size={16} /> },
  { id: "CL", label: "عدسات لاصقة", icon: <Activity size={16} /> },
  { id: "AX", label: "إكسسوارات", icon: <Package size={16} /> },
];

export function ProductGrid() {
  const { addToCart } = usePOSStore();
  const [activeCategory, setActiveCategory] = useState("all");
  const [search, setSearch] = useState("");

  const { query } = useApiForm({
    alias: "products_products_list",
    enabled: true,
  });

  const products = query?.data?.results || [];

  const filtered = products.filter((p: any) => 
    (activeCategory === "all" || p.main_group === activeCategory) &&
    (p.name?.includes(search) || p.sku?.includes(search) || p.model?.includes(search))
  );

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900 rounded-tl-xl overflow-hidden">
      {/* Search Bar & Categories */}
      <div className="p-4 border-b border-gray-100 dark:border-gray-800 space-y-3">
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input 
            placeholder="ابحث بالاسم، الموديل أو الباركود..." 
            className="pr-10 h-12 text-lg bg-gray-50 dark:bg-gray-800 border-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
          {CATEGORIES.map((cat) => (
            <Button
              key={cat.id}
              variant={activeCategory === cat.id ? "default" : "outline"}
              className="flex-shrink-0 rounded-full h-9"
              onClick={() => setActiveCategory(cat.id)}
            >
              {cat.icon && <span className="mr-2 ml-1">{cat.icon}</span>}
              {cat.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto p-4">
        {query.isLoading ? (
          <div className="flex items-center justify-center h-full text-gray-400">جاري تحميل المنتجات...</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered.map((product: any) => (
              <div 
                key={product.id}
                onClick={() => addToCart({
                  productId: product.id.toString(),
                  name: product.name || product.model,
                  price: 150, // TODO: Fetch from pricing table based on partner
                  tax: 0.15,
                  type: product.main_group,
                  quantity: 1,
                  discount: 0
                })}
                className="cursor-pointer group relative bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-3 hover:shadow-lg hover:border-primary/50 transition-all text-center flex flex-col items-center gap-2"
              >
                <div className="w-20 h-20 bg-gray-50 dark:bg-gray-900 rounded-full flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                  <Glasses className="text-gray-400 w-8 h-8" />
                </div>
                <h3 className="font-semibold text-sm line-clamp-2">{product.name || product.model}</h3>
                <p className="text-primary font-bold">{150} ر.س</p>
                <p className="text-xs text-gray-400">{product.brand_name}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import React, { useEffect } from "react";
import { usePOSStore } from "../store/usePOSStore";
import { Maximize, Minimize, ShoppingBag } from "lucide-react";
import { Button } from "@/src/shared/components/shadcn/ui/button";
import { ProductGrid } from "../components/pos/ProductGrid";
import { POSCart } from "../components/pos/POSCart";
import { POSCustomerPanel } from "../components/pos/POSCustomerPanel";
import { POSPaymentPanel } from "../components/pos/POSPaymentPanel";

export function RetailPOSPage() {
  const { isFullScreen, toggleFullScreen } = usePOSStore();

  // Handle FullScreen API if needed
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isFullScreen) {
        toggleFullScreen();
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isFullScreen, toggleFullScreen]);

  return (
    <div
      className={`transition-all duration-300 ease-in-out bg-gray-50 dark:bg-gray-900 ${
        isFullScreen
          ? "fixed inset-0 z-[100] h-screen w-screen overflow-hidden"
          : "relative h-[calc(100vh-6rem)]" // Assumes dashboard header/sidebar takes some space
      }`}
    >
      {/* Top Header inside POS */}
      <div className="h-14 bg-white dark:bg-gray-800 border-b flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-primary/10 rounded-lg">
            <ShoppingBag className="w-5 h-5 text-primary" />
          </div>
          <h1 className="text-lg font-bold">نقطة البيع (تجزئة)</h1>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={toggleFullScreen}
          title={isFullScreen ? "تصغير" : "ملء الشاشة"}
        >
          {isFullScreen ? (
            <Minimize className="w-5 h-5" />
          ) : (
            <Maximize className="w-5 h-5" />
          )}
        </Button>
      </div>

      {/* Main Grid: Products on Right (60%), Cart/Customer on Left (40%) */}
      <div className="flex flex-col md:flex-row h-[calc(100%-3.5rem)] overflow-hidden">
        {/* Right Area: Products */}
        <div className="w-full md:w-3/5 lg:w-[65%] border-l flex flex-col h-full bg-white/50 dark:bg-gray-900/50">
          <ProductGrid />
        </div>

        {/* Left Area: Cart, Customer, Payment */}
        <div className="w-full md:w-2/5 lg:w-[35%] flex flex-col h-full bg-white dark:bg-gray-800 shadow-xl z-10">
          <div className="flex-none p-3 border-b border-gray-100 dark:border-gray-700">
            <POSCustomerPanel />
          </div>
          
          <div className="flex-1 overflow-y-auto bg-gray-50/50 dark:bg-gray-900/50 p-2">
            <POSCart />
          </div>

          <div className="flex-none p-4 border-t border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
            <POSPaymentPanel />
          </div>
        </div>
      </div>
    </div>
  );
}

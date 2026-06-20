import React from "react";
import { usePOSStore } from "../../store/usePOSStore";
import { Minus, Plus, Trash2 } from "lucide-react";
import { Button } from "@/src/shared/components/shadcn/ui/button";

export function POSCart() {
  const { cart, updateQuantity, removeFromCart } = usePOSStore();

  if (cart.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-2">
        <ShoppingCartIcon className="w-12 h-12 opacity-20" />
        <p>السلة فارغة</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {cart.map((item) => (
        <div key={item.id} className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-100 dark:border-gray-700 shadow-sm flex items-center justify-between">
          <div className="flex-1">
            <h4 className="font-semibold text-sm line-clamp-1">{item.name}</h4>
            <div className="text-primary font-bold text-sm">{item.price} ر.س</div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center bg-gray-50 dark:bg-gray-900 rounded-lg p-1 border border-gray-200 dark:border-gray-700">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-7 w-7 rounded-md"
                onClick={() => updateQuantity(item.id, item.quantity - 1)}
              >
                <Minus size={14} />
              </Button>
              <span className="w-8 text-center font-medium">{item.quantity}</span>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-7 w-7 rounded-md"
                onClick={() => updateQuantity(item.id, item.quantity + 1)}
              >
                <Plus size={14} />
              </Button>
            </div>
            
            <Button 
              variant="destructive" 
              size="icon" 
              className="h-8 w-8"
              onClick={() => removeFromCart(item.id)}
            >
              <Trash2 size={16} />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}

// Simple local icon for empty cart
function ShoppingCartIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="8" cy="21" r="1" />
      <circle cx="19" cy="21" r="1" />
      <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
    </svg>
  );
}

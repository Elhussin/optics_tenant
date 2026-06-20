"use client";

import React, { useState, useRef } from "react";
import { useTranslations } from "next-intl";
import { Search, Save, Loader2, Eye, EyeOff, Barcode } from "lucide-react";
import { Button } from "@/src/shared/components/shadcn/ui/button";
import { Input } from "@/src/shared/components/shadcn/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/shared/components/shadcn/ui/table";
import { Switch } from "@/src/shared/components/shadcn/ui/switch";
import { Label } from "@/src/shared/components/shadcn/ui/label";

interface ScannedItem {
  id: string;
  sku: string;
  name: string;
  systemQuantity: number;
  scannedQuantity: number;
}

export function StockTaking() {
  const t = useTranslations("inventory");
  const [isBlindCount, setIsBlindCount] = useState(true);
  const [barcodeInput, setBarcodeInput] = useState("");
  const [scannedItems, setScannedItems] = useState<ScannedItem[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // Mock API for barcode scan
  const handleScan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcodeInput.trim()) return;

    // TODO: fetch product via API by SKU/Barcode
    const mockProduct = {
      id: Math.random().toString(),
      sku: barcodeInput,
      name: `Product ${barcodeInput}`,
      systemQuantity: Math.floor(Math.random() * 50) + 1,
    };

    setScannedItems((prev) => {
      const existingIndex = prev.findIndex((i) => i.sku === barcodeInput);
      if (existingIndex >= 0) {
        const newItems = [...prev];
        newItems[existingIndex].scannedQuantity += 1;
        return newItems;
      }
      return [...prev, { ...mockProduct, scannedQuantity: 1 }];
    });

    setBarcodeInput("");
    inputRef.current?.focus();
  };

  const updateQuantity = (sku: string, newQty: number) => {
    setScannedItems((prev) =>
      prev.map((item) =>
        item.sku === sku ? { ...item, scannedQuantity: newQty } : item
      )
    );
  };

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
      <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Barcode className="text-primary w-6 h-6" />
          جرد المخزون (Stock Taking)
        </h2>
        
        <div className="flex items-center space-x-2 space-x-reverse bg-gray-50 dark:bg-gray-800 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700">
          <Switch 
            id="blind-count" 
            checked={isBlindCount}
            onCheckedChange={setIsBlindCount}
          />
          <Label htmlFor="blind-count" className="flex items-center gap-2 cursor-pointer font-medium text-sm">
            {isBlindCount ? <EyeOff className="w-4 h-4 text-gray-500" /> : <Eye className="w-4 h-4 text-primary" />}
            الجرد الأعمى (Blind Count)
          </Label>
        </div>
      </div>

      <div className="p-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
        <form onSubmit={handleScan} className="flex gap-2 max-w-xl mx-auto">
          <Input 
            ref={inputRef}
            placeholder="امسح الباركود هنا (Scan Barcode)..." 
            value={barcodeInput}
            onChange={(e) => setBarcodeInput(e.target.value)}
            className="flex-1 text-lg h-14 bg-white dark:bg-gray-900 border-2"
            autoFocus
          />
          <Button type="submit" className="h-14 w-14 rounded-xl" size="icon">
            <Search className="w-6 h-6" />
          </Button>
        </form>
      </div>

      <div className="flex-1 overflow-auto p-0">
        <Table>
          <TableHeader className="bg-gray-100 dark:bg-gray-800 sticky top-0 z-10">
            <TableRow>
              <TableHead className="w-32">الباركود / SKU</TableHead>
              <TableHead>اسم المنتج</TableHead>
              {!isBlindCount && <TableHead className="text-center w-32">رصيد النظام</TableHead>}
              <TableHead className="text-center w-40">الكمية المجردة</TableHead>
              {!isBlindCount && <TableHead className="text-center w-32">الفرق</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {scannedItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={isBlindCount ? 3 : 5} className="text-center py-20 text-gray-400">
                  <div className="flex flex-col items-center justify-center">
                    <Barcode className="w-16 h-16 mb-4 opacity-20" />
                    <p className="text-lg">لم يتم مسح أي منتج بعد</p>
                    <p className="text-sm opacity-70 mt-1">قم بتمرير جهاز الباركود على المنتجات للبدء بالجرد</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              scannedItems.map((item) => {
                const diff = item.scannedQuantity - item.systemQuantity;
                const isShortage = diff < 0;
                const isSurplus = diff > 0;
                
                return (
                  <TableRow key={item.sku} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <TableCell className="font-mono text-sm">{item.sku}</TableCell>
                    <TableCell className="font-semibold">{item.name}</TableCell>
                    
                    {!isBlindCount && (
                      <TableCell className="text-center text-gray-500 font-mono text-lg">
                        {item.systemQuantity}
                      </TableCell>
                    )}
                    
                    <TableCell>
                      <Input 
                        type="number" 
                        min="0"
                        className="text-center font-bold text-xl h-12 bg-white dark:bg-gray-900"
                        value={item.scannedQuantity}
                        onChange={(e) => updateQuantity(item.sku, parseInt(e.target.value) || 0)}
                      />
                    </TableCell>
                    
                    {!isBlindCount && (
                      <TableCell className="text-center">
                        <span className={`font-bold px-3 py-1.5 rounded-md text-sm ${
                          isShortage ? "bg-red-100 text-red-700" : 
                          isSurplus ? "bg-emerald-100 text-emerald-700" : 
                          "bg-gray-100 text-gray-700"
                        }`}>
                          {diff > 0 ? `+${diff}` : diff}
                        </span>
                      </TableCell>
                    )}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 flex justify-end gap-3">
        <Button variant="outline" size="lg" className="h-12" onClick={() => setScannedItems([])}>
          تفريغ القائمة
        </Button>
        <Button size="lg" className="h-12 px-8 gap-2" disabled={scannedItems.length === 0}>
          <Save className="w-5 h-5" />
          اعتماد الجرد وتسوية الرصيد
        </Button>
      </div>
    </div>
  );
}

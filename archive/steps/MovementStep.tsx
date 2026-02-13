"use client";

import React from "react";
import {
  ShoppingCart,
  ArrowUpCircle,
  Settings,
  AlertTriangle,
  Undo2,
  DollarSign,
  Hash,
  FileText,
} from "lucide-react";
import { Input } from "@/src/shared/components/shadcn/ui/input";
import { Label } from "@/src/shared/components/shadcn/ui/label";
import { Textarea } from "@/src/shared/components/shadcn/ui/textarea";
import { useInventoryFormStore } from "../../../store";
import { MovementType } from "../../../types";

const movementTypes: {
  type: MovementType;
  label: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  requiresCost: boolean;
}[] = [
  {
    type: "purchase",
    label: "شراء / إعادة تخزين",
    description: "إضافة مخزون جديد من المورد",
    icon: <ShoppingCart className="w-5 h-5" />,
    color: "text-green-600 dark:text-green-400",
    bgColor: "bg-green-100 dark:bg-green-900/30",
    requiresCost: true,
  },
  {
    type: "adjustment",
    label: "تعديل المخزون",
    description: "تعديل يدوي: موجب للإضافة، سالب للنقصان",
    icon: <Settings className="w-5 h-5" />,
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-100 dark:bg-blue-900/30",
    requiresCost: false,
  },
  {
    type: "damage",
    label: "تلف / خسارة",
    description: "تسجيل منتجات تالفة أو مفقودة",
    icon: <AlertTriangle className="w-5 h-5" />,
    color: "text-red-600 dark:text-red-400",
    bgColor: "bg-red-100 dark:bg-red-900/30",
    requiresCost: false,
  },
  {
    type: "return",
    label: "مرتجع من عميل",
    description: "إضافة منتجات مرتجعة للمخزون",
    icon: <Undo2 className="w-5 h-5" />,
    color: "text-amber-600 dark:text-amber-400",
    bgColor: "bg-amber-100 dark:bg-amber-900/30",
    requiresCost: false,
  },
];

export function MovementStep() {
  const store = useInventoryFormStore();

  const selectedType = movementTypes.find((t) => t.type === store.movementType);
  const requiresCost = selectedType?.requiresCost || false;

  return (
    <div className="space-y-8">
      {/* Movement Type Selection */}
      <div className="space-y-4">
        <Label className="text-base font-medium">نوع الحركة</Label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {movementTypes.map((type) => (
            <div
              key={type.type}
              onClick={() => store.setMovementType(type.type)}
              className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all hover:shadow-md ${
                store.movementType === type.type
                  ? "border-primary bg-primary/5 shadow-md"
                  : "border-gray-200 dark:border-gray-700 hover:border-primary/50"
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center ${type.bgColor} ${type.color}`}
                >
                  {type.icon}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-main">{type.label}</h3>
                  <p className="text-sm text-secondary">{type.description}</p>
                </div>
              </div>

              {/* Radio indicator */}
              <div className="absolute top-4 left-4">
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    store.movementType === type.type
                      ? "border-primary bg-primary"
                      : "border-gray-300"
                  }`}
                >
                  {store.movementType === type.type && (
                    <div className="w-2 h-2 rounded-full bg-white" />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quantity and Cost */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Quantity */}
        <div className="space-y-2">
          <Label htmlFor="quantity" className="flex items-center gap-2">
            <Hash className="w-4 h-4" />
            الكمية <span className="text-red-500">*</span>
            {store.movementType === "adjustment" && (
              <span className="text-xs text-blue-500">
                (موجب للإضافة، سالب للنقصان)
              </span>
            )}
          </Label>
          <Input
            id="quantity"
            type="number"
            min={store.movementType === "adjustment" ? undefined : "1"}
            value={store.quantity || ""}
            onChange={(e) => store.setQuantity(parseInt(e.target.value) || 0)}
            placeholder={
              store.movementType === "adjustment"
                ? "مثال: 5 للإضافة، -3 للنقصان"
                : "أدخل الكمية"
            }
            className="text-lg"
          />
          {store.currentQuantity > 0 && (
            <p className="text-xs text-secondary">
              الكمية الحالية في المخزون: {store.currentQuantity}
            </p>
          )}
        </div>

        {/* Cost per unit (for purchase) */}
        <div className="space-y-2">
          <Label htmlFor="cost" className="flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            سعر الوحدة (الشراء){" "}
            {requiresCost && <span className="text-red-500">*</span>}
          </Label>
          <div className="relative">
            <Input
              id="cost"
              type="number"
              min="0"
              step="0.01"
              value={store.costPerUnit || ""}
              onChange={(e) =>
                store.setCostPerUnit(parseFloat(e.target.value) || 0)
              }
              placeholder="0.00"
              className="text-lg pl-12"
              disabled={!requiresCost && store.movementType !== "return"}
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary">
              ر.س
            </span>
          </div>
          {requiresCost && store.costPerUnit <= 0 && (
            <p className="text-xs text-red-500 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              يجب إدخال سعر الشراء
            </p>
          )}
        </div>
      </div>

      {/* Total Cost Preview (for purchase) */}
      {requiresCost && store.quantity > 0 && store.costPerUnit > 0 && (
        <div className="p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
          <div className="flex items-center justify-between">
            <span className="text-green-700 dark:text-green-300">
              إجمالي تكلفة الشراء:
            </span>
            <span className="text-2xl font-bold text-green-600 dark:text-green-400">
              {(store.quantity * store.costPerUnit).toFixed(2)} ر.س
            </span>
          </div>
        </div>
      )}

      {/* Reference Number */}
      <div className="space-y-2">
        <Label htmlFor="reference" className="flex items-center gap-2">
          <FileText className="w-4 h-4" />
          رقم المرجع (اختياري)
        </Label>
        <Input
          id="reference"
          value={store.referenceNumber}
          onChange={(e) => store.setReferenceNumber(e.target.value)}
          placeholder="مثال: فاتورة رقم 12345"
        />
        <p className="text-xs text-secondary">
          يمكنك إضافة رقم فاتورة الشراء أو أي مرجع آخر
        </p>
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <Label htmlFor="notes" className="flex items-center gap-2">
          <FileText className="w-4 h-4" />
          ملاحظات (اختياري)
        </Label>
        <Textarea
          id="notes"
          value={store.notes}
          onChange={(e) => store.setNotes(e.target.value)}
          placeholder="أي ملاحظات إضافية..."
          rows={3}
        />
      </div>
    </div>
  );
}

"use client";

import React, { useMemo } from "react";
import {
  CreditCard,
  Percent,
  Calculator,
  Calendar,
  AlertCircle,
  FileText,
} from "lucide-react";
import { Input } from "@/src/shared/components/shadcn/ui/input";
import { Label } from "@/src/shared/components/shadcn/ui/label";
import { Textarea } from "@/src/shared/components/shadcn/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/shared/components/shadcn/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/shared/components/shadcn/ui/card";
import { useOrderFormStore } from "../../store/useOrderFormStore";
import { PAYMENT_TYPE_OPTIONS, ORDER_TYPE_OPTIONS } from "../../types";
import { cn } from "@/src/shared/utils/cn";

export function PaymentStep() {
  const store = useOrderFormStore();

  // حساب الحد الأقصى للخصم بناءً على المنتجات
  const maxAllowedDiscount = useMemo(() => {
    // حالياً نستخدم 20% كحد أقصى افتراضي
    // يمكن تحسينه لاحقاً للحصول على الخصم من كل منتج
    return store.subtotal * 0.2; // 20% max discount
  }, [store.subtotal]);

  // التحقق من صحة البيانات
  const validationErrors = useMemo(() => {
    const errors: string[] = [];

    // التحقق من الخصم
    if (store.discountAmount < 0) {
      errors.push("الخصم لا يمكن أن يكون سالباً");
    }
    if (store.discountAmount > store.subtotal) {
      errors.push("الخصم لا يمكن أن يتجاوز إجمالي المنتجات");
    }

    // التحقق من المبلغ المدفوع
    if (store.paidAmount < 0) {
      errors.push("المبلغ المدفوع لا يمكن أن يكون سالباً");
    }
    if (store.paidAmount > store.totalAmount) {
      errors.push("المبلغ المدفوع لا يمكن أن يتجاوز المبلغ المطلوب");
    }

    return errors;
  }, [
    store.discountAmount,
    store.paidAmount,
    store.subtotal,
    store.totalAmount,
  ]);

  // معالجة تغيير الخصم مع التحقق
  const handleDiscountAmountChange = (value: number) => {
    // منع القيم السالبة
    if (value < 0) value = 0;
    // منع تجاوز الإجمالي
    if (value > store.subtotal) value = store.subtotal;
    store.setDiscountAmount(value);
  };

  // معالجة تغيير المبلغ المدفوع مع التحقق
  const handlePaidAmountChange = (value: number) => {
    // منع القيم السالبة
    if (value < 0) value = 0;
    // منع تجاوز المبلغ المطلوب
    if (value > store.totalAmount) value = store.totalAmount;
    store.setPaidAmount(value);
  };

  // معالجة تغيير نسبة الخصم
  const handleDiscountPercentChange = (percent: number) => {
    // منع القيم السالبة أو أكثر من 100%
    if (percent < 0) percent = 0;
    if (percent > 100) percent = 100;
    store.setDiscountPercent(percent);
  };

  // حالة الدفع
  const paymentStatus = useMemo(() => {
    if (store.paidAmount >= store.totalAmount) {
      return {
        status: "paid",
        label: "مدفوع بالكامل",
        color: "text-green-600 bg-green-50",
      };
    } else if (store.paidAmount > 0) {
      return {
        status: "partial",
        label: "دفع جزئي",
        color: "text-yellow-600 bg-yellow-50",
      };
    }
    return {
      status: "pending",
      label: "غير مدفوع",
      color: "text-red-600 bg-red-50",
    };
  }, [store.paidAmount, store.totalAmount]);

  // المبلغ المتبقي
  const remainingAmount = store.totalAmount - store.paidAmount;

  return (
    <div className="space-y-6">
      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
          <CardContent className="py-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="text-red-500 mt-0.5" size={20} />
              <div className="space-y-1">
                {validationErrors.map((error, index) => (
                  <p
                    key={index}
                    className="text-sm text-red-600 dark:text-red-400"
                  >
                    {error}
                  </p>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payment Type & Order Type */}
      <div className="grid grid-cols-2 gap-4">
        {/* Payment Type */}
        <div className="space-y-2">
          <Label className="text-base font-semibold flex items-center gap-2">
            <CreditCard size={18} />
            طريقة الدفع
          </Label>
          <Select
            value={store.paymentType}
            onValueChange={(value) => store.setPaymentType(value as any)}
          >
            <SelectTrigger
              className={cn(
                "w-full h-11 rounded-lg transition-all duration-300",
                "bg-surface",
                "border-2 border-primary/50",
                "shadow-[0_0_0_0px_transparent]",
                "focus:outline-none focus:border-primary",
                "focus:shadow-[0_0_0_3px_hsl(var(--primary)/0.2)]",
                "hover:border-primary/50 hover:shadow-sm"
              )}
            >
              <SelectValue placeholder="اختر طريقة الدفع" />
            </SelectTrigger>
            <SelectContent className="animate-fade-in-down border-2 border-primary/50">
              {PAYMENT_TYPE_OPTIONS.map((option) => (
                <SelectItem
                  key={option.value}
                  value={option.value}
                  className={cn(
                    "cursor-pointer transition-colors bg-surface",
                    "focus:bg-primary/10 focus:text-primary",
                    "data-[state=checked]:bg-primary/10 data-[state=checked]:text-primary data-[state=checked]:font-semibold"
                  )}
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Order Type */}
        <div className="space-y-2">
          <Label className="text-base font-semibold flex items-center gap-2">
            <FileText size={18} />
            نوع الطلب
          </Label>
          <Select
            value={store.orderType}
            onValueChange={(value) => store.setOrderType(value as any)}
          >
            <SelectTrigger
              className={cn(
                "w-full h-11 rounded-lg transition-all duration-300",
                "bg-surface",
                "border-2 border-primary/50",
                "shadow-[0_0_0_0px_transparent]",
                "focus:outline-none focus:border-primary",
                "focus:shadow-[0_0_0_3px_hsl(var(--primary)/0.2)]",
                "hover:border-primary/50 hover:shadow-sm"
              )}
            >
              <SelectValue placeholder="اختر نوع الطلب" />
            </SelectTrigger>
            <SelectContent className="animate-fade-in-down border-2 border-primary/50">
              {ORDER_TYPE_OPTIONS.map((option) => (
                <SelectItem
                  key={option.value}
                  value={option.value}
                  className={cn(
                    "cursor-pointer transition-colors bg-surface",
                    "focus:bg-primary/10 focus:text-primary",
                    "data-[state=checked]:bg-primary/10 data-[state=checked]:text-primary data-[state=checked]:font-semibold"
                  )}
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Discount */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Percent size={20} />
            الخصم
            <span className="text-xs text-secondary font-normal">
              (الحد الأقصى: {maxAllowedDiscount.toFixed(2)} ر.س)
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>نسبة الخصم (%)</Label>
              <Input
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={store.discountPercent}
                onChange={(e) =>
                  handleDiscountPercentChange(parseFloat(e.target.value) || 0)
                }
                className={
                  store.discountAmount > store.subtotal ? "border-red-500" : ""
                }
              />
            </div>
            <div>
              <Label>مبلغ الخصم (ر.س)</Label>
              <Input
                type="number"
                min="0"
                max={store.subtotal}
                step="0.01"
                value={store.discountAmount}
                onChange={(e) =>
                  handleDiscountAmountChange(parseFloat(e.target.value) || 0)
                }
                className={
                  store.discountAmount > store.subtotal ? "border-red-500" : ""
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tax & Amount Paid */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Calculator size={20} />
            الضريبة والمدفوع
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>نسبة الضريبة (%)</Label>
              <Input
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={(store.taxRate * 100).toFixed(2)}
                onChange={(e) =>
                  store.setTaxRate(parseFloat(e.target.value) / 100 || 0)
                }
              />
            </div>
            <div>
              <Label>المبلغ المدفوع (ر.س)</Label>
              <Input
                type="number"
                min="0"
                max={store.totalAmount}
                step="0.01"
                value={store.paidAmount}
                onChange={(e) =>
                  handlePaidAmountChange(parseFloat(e.target.value) || 0)
                }
                className={
                  store.paidAmount > store.totalAmount ? "border-red-500" : ""
                }
              />
              {/* أزرار سريعة */}
              <div className="flex gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => store.setPaidAmount(store.totalAmount)}
                  className="text-xs px-2 py-1 rounded bg-green-100 text-green-700 hover:bg-green-200"
                >
                  دفع كامل
                </button>
                <button
                  type="button"
                  onClick={() => store.setPaidAmount(store.totalAmount / 2)}
                  className="text-xs px-2 py-1 rounded bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                >
                  50%
                </button>
                <button
                  type="button"
                  onClick={() => store.setPaidAmount(0)}
                  className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-700 hover:bg-gray-200"
                >
                  آجل
                </button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Expected Delivery */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <Calendar size={18} />
          تاريخ التسليم المتوقع
        </Label>
        <Input
          type="datetime-local"
          value={store.expectedDelivery || ""}
          onChange={(e) => store.setExpectedDelivery(e.target.value || null)}
        />
      </div>

      {/* Notes */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>ملاحظات للعميل</Label>
          <Textarea
            placeholder="ملاحظات تظهر في الفاتورة..."
            value={store.notes}
            onChange={(e) => store.setNotes(e.target.value)}
            rows={3}
          />
        </div>
        <div className="space-y-2">
          <Label>ملاحظات داخلية</Label>
          <Textarea
            placeholder="ملاحظات داخلية للموظفين فقط..."
            value={store.internalNotes}
            onChange={(e) => store.setInternalNotes(e.target.value)}
            rows={3}
          />
        </div>
      </div>

      {/* Final Summary */}
      <Card className="bg-gradient-to-br from-primary/5 to-blue-50 dark:from-primary/10 dark:to-gray-800">
        <CardContent className="py-6">
          <div className="space-y-3">
            {/* Payment Status Badge */}
            <div className="flex justify-between items-center">
              <span className="text-secondary">حالة الدفع:</span>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${paymentStatus.color}`}
              >
                {paymentStatus.label}
              </span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-secondary">المجموع الفرعي:</span>
              <span className="font-medium">
                {store.subtotal.toFixed(2)} ر.س
              </span>
            </div>

            {store.discountAmount > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span>الخصم ({store.discountPercent.toFixed(1)}%):</span>
                <span>-{store.discountAmount.toFixed(2)} ر.س</span>
              </div>
            )}

            <div className="flex justify-between text-sm">
              <span className="text-secondary">
                الضريبة ({(store.taxRate * 100).toFixed(0)}%):
              </span>
              <span className="font-medium">
                {store.taxAmount.toFixed(2)} ر.س
              </span>
            </div>

            <div className="border-t pt-3 mt-3">
              <div className="flex justify-between text-xl font-bold">
                <span>الإجمالي:</span>
                <span className="text-primary">
                  {store.totalAmount.toFixed(2)} ر.س
                </span>
              </div>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-secondary">المدفوع:</span>
              <span className="font-medium text-green-600">
                {store.paidAmount.toFixed(2)} ر.س
              </span>
            </div>

            {remainingAmount > 0 && (
              <div className="flex justify-between text-lg font-bold border-t pt-2">
                <span>المتبقي:</span>
                <span className="text-red-500">
                  {remainingAmount.toFixed(2)} ر.س
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

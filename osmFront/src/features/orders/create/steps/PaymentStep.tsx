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
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/shared/components/shadcn/ui/card";
import { useApiForm } from "@/src/shared/hooks/useApiForm";
import { useOrderFormStore } from "../../store/useOrderFormStore";
import type { PaymentMethod } from "../../types";
import {
  SelectField,
  TextField,
  TextareaField,
} from "@/src/shared/components/field/Fields";

export function PaymentStep() {
  const store = useOrderFormStore();

  const { query: paymentMethodsQuery } = useApiForm({
    alias: "sales_payment_methods_list",
    defaultValues: {
      is_active: true,
      page_size: 200,
      ordering: "name_ar",
    },
    enabled: true,
  });

  const paymentMethods: PaymentMethod[] = useMemo(() => {
    const data: any = paymentMethodsQuery.data;
    if (!data) return [];
    if (Array.isArray(data)) return data;
    return Array.isArray(data.results) ? data.results : [];
  }, [paymentMethodsQuery.data]);

  // Max discount calculation
  const maxAllowedDiscount = useMemo(() => {
    return store.subtotal * 0.2; // 20% max discount
  }, [store.subtotal]);

  // Validation
  const validationErrors = useMemo(() => {
    const errors: string[] = [];

    if (store.discountAmount < 0) errors.push("الخصم لا يمكن أن يكون سالباً");
    if (store.discountAmount > store.subtotal)
      errors.push("الخصم لا يمكن أن يتجاوز إجمالي المنتجات");

    if (store.paidAmount < 0)
      errors.push("المبلغ المدفوع لا يمكن أن يكون سالباً");
    if (store.paidAmount > store.totalAmount)
      errors.push("المبلغ المدفوع لا يمكن أن يتجاوز المبلغ المطلوب");

    return errors;
  }, [
    store.discountAmount,
    store.paidAmount,
    store.subtotal,
    store.totalAmount,
  ]);

  // Handlers
  const handleDiscountAmountChange = (value: number) => {
    if (value < 0) value = 0;
    if (value > store.subtotal) value = store.subtotal;
    store.setDiscountAmount(value);
  };

  const handlePaidAmountChange = (value: number) => {
    if (value < 0) value = 0;
    if (value > store.totalAmount) value = store.totalAmount;
    store.setPaidAmount(value);
  };

  const handleDiscountPercentChange = (percent: number) => {
    if (percent < 0) percent = 0;
    if (percent > 100) percent = 100;
    store.setDiscountPercent(percent);
  };

  // Payment Status
  const paymentStatus = useMemo(() => {
    // For insurance, we consider valid if customer paid their share
    // But logically "Paid" means full amount settled.
    // However, usually "Payment Status" refers to customer payment status in POS context
    // If insurance covers rest, it's effectively "Paid" or "Credit"
    const totalPaid = store.paidAmount + store.partnerShare;

    if (totalPaid >= store.totalAmount - 0.01) {
      // tolerance
      return {
        status: "paid",
        label: "مدفوع بالكامل",
        color: "text-green-600 bg-green-50",
      };
    } else if (store.paidAmount > 0 || store.partnerShare > 0) {
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
  }, [store.paidAmount, store.totalAmount, store.partnerShare]);

  const remainingAmount = store.customerShare - store.paidAmount;

  return (
    <div className="space-y-6 animate-fade-in-up">
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

      {/* Payment Method */}
      <div className="space-y-2">
        <h3 className="text-base font-semibold flex items-center gap-2">
          <CreditCard size={18} />
          طريقة الدفع
        </h3>
        <SelectField
          fieldRow={{ placeholder: "اختر طريقة الدفع" } as any}
          field={{
            value: store.paymentMethodId ? String(store.paymentMethodId) : "",
            onChange: (val: string) =>
              store.setPaymentMethodId(val ? parseInt(val, 10) : null),
          }}
          options={paymentMethods.map((m) => ({
            label: m.name_ar || m.name_en || m.code,
            value: String(m.id),
          }))}
        />
      </div>

      {/* Discount Section */}
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
              <label className="text-sm font-medium mb-1.5 block">
                نسبة الخصم (%)
              </label>
              <TextField
                fieldRow={
                  {
                    type: "number",
                    placeholder: "0",
                    className:
                      store.discountAmount > store.subtotal
                        ? "border-red-500"
                        : "",
                  } as any
                }
                field={{
                  value: store.discountPercent,
                  onChange: (e: any) =>
                    handleDiscountPercentChange(
                      parseFloat(e.target.value) || 0,
                    ),
                }}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">
                مبلغ الخصم (ر.س)
              </label>
              <TextField
                fieldRow={
                  {
                    type: "number",
                    placeholder: "0",
                    className:
                      store.discountAmount > store.subtotal
                        ? "border-red-500"
                        : "",
                  } as any
                }
                field={{
                  value: store.discountAmount,
                  onChange: (e: any) =>
                    handleDiscountAmountChange(parseFloat(e.target.value) || 0),
                }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tax & Payment Section */}
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
              <label className="text-sm font-medium mb-1.5 block">
                نسبة الضريبة (%)
              </label>
              <TextField
                fieldRow={{ type: "number", placeholder: "15" } as any}
                field={{
                  value: (store.taxRate * 100).toFixed(2),
                  onChange: (e: any) =>
                    store.setTaxRate(parseFloat(e.target.value) / 100 || 0),
                }}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">
                المبلغ المدفوع (ر.س)
              </label>
              <TextField
                fieldRow={
                  {
                    type: "number",
                    placeholder: "0.00",
                    className:
                      store.paidAmount > store.totalAmount
                        ? "border-red-500"
                        : "",
                  } as any
                }
                field={{
                  value: store.paidAmount,
                  onChange: (e: any) =>
                    handlePaidAmountChange(parseFloat(e.target.value) || 0),
                }}
              />

              {/* Quick Actions */}
              <div className="flex gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => store.setPaidAmount(store.customerShare)}
                  className="text-xs px-2 py-1 rounded bg-green-100 text-green-700 hover:bg-green-200 transition-colors"
                >
                  دفع كامل (العميل)
                </button>
                <button
                  type="button"
                  onClick={() => store.setPaidAmount(store.customerShare / 2)}
                  className="text-xs px-2 py-1 rounded bg-yellow-100 text-yellow-700 hover:bg-yellow-200 transition-colors"
                >
                  50%
                </button>
                <button
                  type="button"
                  onClick={() => store.setPaidAmount(0)}
                  className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                >
                  آجل
                </button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Insurance Details Section */}
      {(store.orderType === "insurance" || store.orderType === "corporate") && (
        <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2 text-blue-700 dark:text-blue-400">
              <FileText size={20} />
              تفاصيل التأمين (تلقائي)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">
                  تغطية التأمين (ر.س)
                </label>
                <TextField
                  fieldRow={
                    {
                      type: "number",
                      readOnly: true,
                      className:
                        "bg-gray-100 dark:bg-gray-800 cursor-not-allowed",
                    } as any
                  }
                  field={{
                    value: store.partnerShare.toFixed(2),
                    onChange: () => {}, // Read only
                  }}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">
                  حصة المريض (ر.س)
                </label>
                <TextField
                  fieldRow={
                    {
                      type: "number",
                      readOnly: true,
                      className:
                        "bg-gray-100 dark:bg-gray-800 cursor-not-allowed",
                    } as any
                  }
                  field={{
                    value: store.customerShare.toFixed(2),
                    onChange: () => {}, // Read only
                  }}
                />
              </div>
            </div>
            <div className="mt-2 text-xs text-blue-600 dark:text-blue-400">
              * يتم حساب الحصص تلقائياً بناًء على نسبة التحمل (
              {store.patientSharePercentage}%)
              {store.maxPatientShare > 0 &&
                ` والحد الأقصى (${store.maxPatientShare} ر.س)`}
              .
            </div>
          </CardContent>
        </Card>
      )}

      {/* Expected Delivery */}
      <div className="space-y-2">
        <label className="text-sm font-medium flex items-center gap-2">
          <Calendar size={18} />
          تاريخ التسليم المتوقع
        </label>
        <TextField
          fieldRow={{ type: "datetime-local" } as any}
          field={{
            value: store.expectedDelivery || "",
            onChange: (e: any) =>
              store.setExpectedDelivery(e.target.value || null),
          }}
        />
      </div>

      {/* Notes */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium block">ملاحظات للعميل</label>
          <TextareaField
            fieldRow={
              {
                placeholder: "ملاحظات تظهر في الفاتورة...",
                required: false,
              } as any
            }
            field={{
              value: store.notes,
              onChange: (e: any) => store.setNotes(e.target.value),
            }}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium block">ملاحظات داخلية</label>
          <TextareaField
            fieldRow={
              {
                placeholder: "ملاحظات داخلية للموظفين فقط...",
                required: false,
              } as any
            }
            field={{
              value: store.internalNotes,
              onChange: (e: any) => store.setInternalNotes(e.target.value),
            }}
          />
        </div>
      </div>

      {/* Final Summary Card */}
      <Card className="bg-gradient-to-br from-primary/5 to-blue-50 dark:from-primary/10 dark:to-gray-800">
        <CardContent className="py-6">
          <div className="space-y-3">
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

            {/* Detailed Breakdown */}
            {(store.orderType === "insurance" ||
              store.orderType === "corporate") && (
              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg space-y-2 border border-blue-100 dark:border-blue-800 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-secondary">حصة العميل (المطلوب):</span>
                  <span className="font-semibold text-foreground">
                    {store.customerShare.toFixed(2)} ر.س
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-secondary">تغطية التأمين:</span>
                  <span className="font-semibold text-blue-600 dark:text-blue-400">
                    {store.partnerShare.toFixed(2)} ر.س
                  </span>
                </div>
              </div>
            )}

            <div className="flex justify-between text-sm pt-2">
              <span className="text-secondary">المدفوع من العميل:</span>
              <span className="font-medium text-green-600">
                {store.paidAmount.toFixed(2)} ر.س
              </span>
            </div>

            {remainingAmount > 0 && (
              <div className="flex justify-between text-lg font-bold border-t pt-2">
                <span>المتبقي على العميل:</span>
                <span className="text-red-500">
                  {Math.max(0, remainingAmount).toFixed(2)} ر.س
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

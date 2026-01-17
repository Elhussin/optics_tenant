// features/payment/components/PaymentMethodSelector.tsx
/**
 * محدد طريقة الدفع
 */

"use client";

import React, { useState } from "react";
import {
  CreditCard,
  Banknote,
  Building2,
  Wallet,
  ChevronLeft,
  CheckCircle,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/shared/components/shadcn/ui/card";
import { TabbyPromoButton, TamaraPromoButton } from "./BNPLButton";
import type { PaymentMethod, BNPLProvider } from "../types/payment.types";

interface PaymentMethodSelectorProps {
  amount: number;
  selectedMethod: PaymentMethod | null;
  onMethodSelect: (method: PaymentMethod) => void;
  onBNPLSelect?: (provider: BNPLProvider) => void;
  showBNPL?: boolean;
  bnplLoading?: boolean;
  disabledMethods?: PaymentMethod[];
}

interface MethodOption {
  id: PaymentMethod;
  name: string;
  icon: React.ReactNode;
  description: string;
}

const paymentMethods: MethodOption[] = [
  {
    id: "cash",
    name: "نقداً",
    icon: <Banknote className="w-5 h-5" />,
    description: "الدفع نقداً في المحل",
  },
  {
    id: "card",
    name: "بطاقة ائتمان",
    icon: <CreditCard className="w-5 h-5" />,
    description: "فيزا، ماستركارد، مدى",
  },
  {
    id: "bank_transfer",
    name: "تحويل بنكي",
    icon: <Building2 className="w-5 h-5" />,
    description: "تحويل لحساب المحل",
  },
  {
    id: "credit",
    name: "آجل",
    icon: <Wallet className="w-5 h-5" />,
    description: "إضافة للحساب",
  },
];

export function PaymentMethodSelector({
  amount,
  selectedMethod,
  onMethodSelect,
  onBNPLSelect,
  showBNPL = true,
  bnplLoading = false,
  disabledMethods = [],
}: PaymentMethodSelectorProps) {
  return (
    <div className="space-y-6">
      {/* Regular Payment Methods */}
      <div>
        <h3 className="text-sm font-semibold text-gray-500 mb-3">طرق الدفع</h3>
        <div className="grid grid-cols-2 gap-3">
          {paymentMethods.map((method) => {
            const isSelected = selectedMethod === method.id;
            const isDisabled = disabledMethods.includes(method.id);

            return (
              <button
                key={method.id}
                onClick={() => !isDisabled && onMethodSelect(method.id)}
                disabled={isDisabled}
                className={`p-4 rounded-xl border-2 transition-all text-right ${
                  isSelected
                    ? "border-primary bg-primary/5 shadow-md"
                    : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                } ${
                  isDisabled
                    ? "opacity-50 cursor-not-allowed"
                    : "cursor-pointer"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div
                    className={`p-2 rounded-lg ${
                      isSelected
                        ? "bg-primary text-white"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                    }`}
                  >
                    {method.icon}
                  </div>
                  {isSelected && (
                    <CheckCircle className="w-5 h-5 text-primary" />
                  )}
                </div>
                <div className="mt-3">
                  <div className="font-semibold">{method.name}</div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    {method.description}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* BNPL Options */}
      {showBNPL && onBNPLSelect && amount >= 100 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-500 mb-3">
            ادفع على أقساط
            <span className="text-xs font-normal text-primary mr-2">
              بدون فوائد
            </span>
          </h3>
          <div className="space-y-3">
            <TabbyPromoButton
              amount={amount}
              onSelect={() => onBNPLSelect("tabby")}
              loading={bnplLoading}
            />
            <TamaraPromoButton
              amount={amount}
              onSelect={() => onBNPLSelect("tamara")}
              loading={bnplLoading}
            />
          </div>
        </div>
      )}

      {/* Amount Display */}
      <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
        <div className="flex items-center justify-between">
          <span className="text-gray-500">المبلغ المطلوب</span>
          <div className="text-left">
            <span className="text-2xl font-bold">
              {amount.toLocaleString()}
            </span>
            <span className="text-sm text-gray-500 mr-1">ر.س</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PaymentMethodSelector;

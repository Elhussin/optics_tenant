// features/payment/components/BNPLButton.tsx
/**
 * زر الدفع الآجل (Tabby / Tamara)
 */

"use client";

import React, { useState } from "react";
import {
  CreditCard,
  Loader2,
  ChevronLeft,
  Calendar,
  DollarSign,
  CheckCircle,
} from "lucide-react";
import type { BNPLProvider } from "../types/payment.types";

interface BNPLButtonProps {
  provider: BNPLProvider;
  amount: number;
  onSelect: (provider: BNPLProvider) => void;
  disabled?: boolean;
  loading?: boolean;
}

// Provider configurations
const providerConfig: Record<
  BNPLProvider,
  {
    name: string;
    nameAr: string;
    logo: string;
    color: string;
    bgColor: string;
    description: string;
    installments: number;
  }
> = {
  tabby: {
    name: "Tabby",
    nameAr: "تابي",
    logo: "/images/tabby-logo.svg",
    color: "text-[#3BFFC1]",
    bgColor: "bg-black hover:bg-gray-900",
    description: "قسّم فاتورتك على 4 دفعات بدون فوائد",
    installments: 4,
  },
  tamara: {
    name: "Tamara",
    nameAr: "تمارا",
    logo: "/images/tamara-logo.svg",
    color: "text-[#F9D74C]",
    bgColor: "bg-[#1D2C4A] hover:bg-[#152238]",
    description: "اشترِ الآن وادفع لاحقاً",
    installments: 3,
  },
};

export function BNPLButton({
  provider,
  amount,
  onSelect,
  disabled = false,
  loading = false,
}: BNPLButtonProps) {
  const config = providerConfig[provider];
  const installmentAmount = amount / config.installments;

  return (
    <button
      onClick={() => onSelect(provider)}
      disabled={disabled || loading}
      className={`w-full p-4 rounded-xl ${config.bgColor} text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Logo placeholder */}
          <div
            className={`w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center ${config.color} font-bold`}
          >
            {config.name.charAt(0)}
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg">{config.nameAr}</span>
              <span className="text-sm opacity-70">{config.name}</span>
            </div>
            <p className="text-sm opacity-80">{config.description}</p>
          </div>
        </div>

        {loading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <ChevronLeft className="w-5 h-5 opacity-50 group-hover:opacity-100 transition-opacity" />
        )}
      </div>

      {/* Installment Preview */}
      <div className="mt-4 pt-4 border-t border-white/20">
        <div className="flex items-center justify-between text-sm">
          <span className="opacity-70">
            {config.installments} دفعات × {installmentAmount.toFixed(2)} ر.س
          </span>
          <span className="font-bold">المجموع: {amount.toFixed(2)} ر.س</span>
        </div>
      </div>
    </button>
  );
}

// Tabby specific button with promo
export function TabbyPromoButton({
  amount,
  onSelect,
  loading = false,
}: {
  amount: number;
  onSelect: () => void;
  loading?: boolean;
}) {
  const installmentAmount = amount / 4;

  return (
    <button
      onClick={onSelect}
      disabled={loading}
      className="w-full p-4 rounded-xl bg-gradient-to-r from-black to-gray-800 text-white group hover:shadow-lg transition-all"
    >
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 bg-[#3BFFC1]/20 rounded-xl flex items-center justify-center">
          <span className="text-[#3BFFC1] text-2xl font-bold">T</span>
        </div>
        <div className="flex-1 text-right">
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-[#3BFFC1] text-black text-xs px-2 py-0.5 rounded-full font-medium">
              بدون فوائد
            </span>
            <span className="font-bold text-lg">تابي</span>
          </div>
          <p className="text-sm text-gray-300">
            قسّم المبلغ على{" "}
            <span className="text-[#3BFFC1] font-bold">4 دفعات</span>
          </p>
          <div className="flex items-center gap-1 mt-2 text-[#3BFFC1]">
            <DollarSign className="w-4 h-4" />
            <span className="font-bold">{installmentAmount.toFixed(2)}</span>
            <span className="text-sm text-gray-400">ر.س / شهرياً</span>
          </div>
        </div>
        {loading ? (
          <Loader2 className="w-6 h-6 animate-spin text-[#3BFFC1]" />
        ) : (
          <ChevronLeft className="w-6 h-6 opacity-50 group-hover:opacity-100 group-hover:-translate-x-1 transition-all" />
        )}
      </div>
    </button>
  );
}

// Tamara specific button with promo
export function TamaraPromoButton({
  amount,
  onSelect,
  loading = false,
}: {
  amount: number;
  onSelect: () => void;
  loading?: boolean;
}) {
  const installmentAmount = amount / 3;

  return (
    <button
      onClick={onSelect}
      disabled={loading}
      className="w-full p-4 rounded-xl bg-gradient-to-r from-[#1D2C4A] to-[#0F1A2E] text-white group hover:shadow-lg transition-all"
    >
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 bg-[#F9D74C]/20 rounded-xl flex items-center justify-center">
          <span className="text-[#F9D74C] text-2xl font-bold">T</span>
        </div>
        <div className="flex-1 text-right">
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-[#F9D74C] text-black text-xs px-2 py-0.5 rounded-full font-medium">
              ادفع لاحقاً
            </span>
            <span className="font-bold text-lg">تمارا</span>
          </div>
          <p className="text-sm text-gray-300">
            قسّم المبلغ على{" "}
            <span className="text-[#F9D74C] font-bold">3 دفعات</span>
          </p>
          <div className="flex items-center gap-1 mt-2 text-[#F9D74C]">
            <DollarSign className="w-4 h-4" />
            <span className="font-bold">{installmentAmount.toFixed(2)}</span>
            <span className="text-sm text-gray-400">ر.س / شهرياً</span>
          </div>
        </div>
        {loading ? (
          <Loader2 className="w-6 h-6 animate-spin text-[#F9D74C]" />
        ) : (
          <ChevronLeft className="w-6 h-6 opacity-50 group-hover:opacity-100 group-hover:-translate-x-1 transition-all" />
        )}
      </div>
    </button>
  );
}

export default BNPLButton;

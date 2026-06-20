import React, { useState } from "react";
import { usePOSStore } from "../../store/usePOSStore";
import { Banknote, CreditCard, Smartphone, CheckCircle, Split } from "lucide-react";
import { Button } from "@/src/shared/components/shadcn/ui/button";
import { Switch } from "@/src/shared/components/shadcn/ui/switch";
import { Label } from "@/src/shared/components/shadcn/ui/label";
import { SplitPaymentModal, PaymentEntry } from "./SplitPaymentModal";
import { safeToast } from "@/src/shared/utils/safeToast";

export function POSPaymentPanel() {
  const { 
    getSubtotal, 
    getDiscountTotal, 
    getTaxTotal, 
    getInsuranceCover, 
    getGrandTotal,
    paymentMethod,
    setPaymentMethod,
    isDirectPaymentEnabled,
    setDirectPaymentEnabled
  } = usePOSStore();

  const [isSplitModalOpen, setIsSplitModalOpen] = useState(false);

  const handlePay = () => {
    // Submit order logic
    console.log("Submitting order with method:", paymentMethod);
    // After success, show print dialog automatically (user preference)
    window.print();
  };

  const handleSplitPayConfirm = (payments: PaymentEntry[]) => {
    console.log("Submitting split payment order with:", payments);
    setIsSplitModalOpen(false);
    safeToast("تم إنشاء الطلب المجزأ بنجاح", { type: "success" });
    // After success, show print dialog automatically
    window.print();
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Summary */}
      <div className="space-y-1.5 text-sm">
        <div className="flex justify-between text-gray-500">
          <span>المجموع الفرعي</span>
          <span>{getSubtotal().toFixed(2)} ر.س</span>
        </div>
        
        {getDiscountTotal() > 0 && (
          <div className="flex justify-between text-red-500">
            <span>الخصم</span>
            <span>-{getDiscountTotal().toFixed(2)} ر.س</span>
          </div>
        )}
        
        <div className="flex justify-between text-gray-500">
          <span>الضريبة (15%)</span>
          <span>{getTaxTotal().toFixed(2)} ر.س</span>
        </div>

        {getInsuranceCover() > 0 && (
          <div className="flex justify-between text-green-600 font-medium">
            <span>تغطية التأمين</span>
            <span>-{getInsuranceCover().toFixed(2)} ر.س</span>
          </div>
        )}

        <div className="flex justify-between font-bold text-lg pt-2 border-t border-gray-100 dark:border-gray-800">
          <span>الإجمالي المطلوب</span>
          <span className="text-primary">{getGrandTotal().toFixed(2)} ر.س</span>
        </div>
      </div>

      {/* Payment Methods */}
      <div className="grid grid-cols-4 gap-2">
        <Button 
          variant={paymentMethod === "cash" ? "default" : "outline"} 
          className="h-12 flex-col gap-1 px-1"
          onClick={() => setPaymentMethod("cash")}
        >
          <Banknote size={18} />
          <span className="text-xs">كاش</span>
        </Button>
        <Button 
          variant={paymentMethod === "card" ? "default" : "outline"} 
          className="h-12 flex-col gap-1 px-1"
          onClick={() => setPaymentMethod("card")}
        >
          <CreditCard size={18} />
          <span className="text-xs">شبكة</span>
        </Button>
        <Button 
          variant={paymentMethod === "tabby" ? "default" : "outline"} 
          className="h-12 flex-col gap-1 px-1"
          onClick={() => setPaymentMethod("tabby")}
        >
          <Smartphone size={18} />
          <span className="text-xs">تابي</span>
        </Button>
        <Button 
          variant={paymentMethod === "tamara" ? "default" : "outline"} 
          className="h-12 flex-col gap-1 px-1"
          onClick={() => setPaymentMethod("tamara")}
        >
          <Smartphone size={18} />
          <span className="text-xs">تمارا</span>
        </Button>
      </div>

      {/* BNPL Options */}
      {(paymentMethod === "tabby" || paymentMethod === "tamara") && (
        <div className="flex items-center space-x-2 space-x-reverse bg-gray-50 dark:bg-gray-900 p-3 rounded-lg border border-gray-100 dark:border-gray-800">
          <Switch 
            id="direct-payment" 
            checked={isDirectPaymentEnabled}
            onCheckedChange={setDirectPaymentEnabled}
          />
          <Label htmlFor="direct-payment" className="text-xs leading-relaxed">
            تفعيل الدفع المباشر للعميل (إرسال رابط الدفع حالاً) بدلاً من التسجيل اليدوي كتقسيط.
          </Label>
        </div>
      )}

      {/* Pay Buttons */}
      <div className="flex gap-2">
        <Button 
          variant="outline"
          className="h-14 px-4 border-dashed border-primary/50 hover:bg-primary/5 text-primary flex-col gap-1"
          onClick={() => setIsSplitModalOpen(true)}
          disabled={getGrandTotal() === 0}
        >
          <Split size={18} />
          <span className="text-xs font-bold">دفع مجزأ</span>
        </Button>
        <Button 
          size="lg" 
          className="flex-1 h-14 text-lg font-bold gap-2"
          onClick={handlePay}
          disabled={!paymentMethod || getGrandTotal() === 0}
        >
          <CheckCircle size={24} />
          {paymentMethod === "tabby" && isDirectPaymentEnabled ? "رابط ودفع" : "دفع وإنشاء الطلب"}
        </Button>
      </div>

      <SplitPaymentModal 
        isOpen={isSplitModalOpen} 
        onClose={() => setIsSplitModalOpen(false)} 
        onConfirm={handleSplitPayConfirm}
      />
    </div>
  );
}

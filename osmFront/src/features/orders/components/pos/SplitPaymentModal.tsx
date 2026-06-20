import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/src/shared/components/shadcn/ui/dialog";
import { Button } from "@/src/shared/components/shadcn/ui/button";
import { Input } from "@/src/shared/components/shadcn/ui/input";
import { Banknote, CreditCard, Smartphone, ShieldPlus, Plus, Trash2 } from "lucide-react";
import { usePOSStore } from "../../store/usePOSStore";
import { safeToast } from "@/src/shared/utils/safeToast";

interface SplitPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (payments: PaymentEntry[]) => void;
}

export type PaymentMethodType = "cash" | "card" | "tabby" | "tamara" | "insurance";

export interface PaymentEntry {
  id: string;
  method: PaymentMethodType;
  amount: number;
}

export function SplitPaymentModal({ isOpen, onClose, onConfirm }: SplitPaymentModalProps) {
  const { getGrandTotal } = usePOSStore();
  const grandTotal = getGrandTotal();
  const [payments, setPayments] = useState<PaymentEntry[]>([
    { id: "1", method: "cash", amount: grandTotal }
  ]);

  useEffect(() => {
    if (isOpen) {
      setPayments([{ id: Date.now().toString(), method: "cash", amount: getGrandTotal() }]);
    }
  }, [isOpen, getGrandTotal]);

  const totalPaid = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const remaining = grandTotal - totalPaid;

  const handleAddPayment = () => {
    if (remaining <= 0) return;
    setPayments([...payments, { id: Date.now().toString(), method: "card", amount: remaining }]);
  };

  const handleRemovePayment = (id: string) => {
    setPayments(payments.filter(p => p.id !== id));
  };

  const handleAmountChange = (id: string, amount: number) => {
    setPayments(payments.map(p => p.id === id ? { ...p, amount } : p));
  };

  const handleMethodChange = (id: string, method: PaymentMethodType) => {
    setPayments(payments.map(p => p.id === id ? { ...p, method } : p));
  };

  const handleConfirm = () => {
    // allow a tiny margin for float errors
    if (Math.abs(remaining) > 0.01) {
      safeToast("يجب أن يتطابق إجمالي المدفوعات مع المطلوب", { type: "error" });
      return;
    }
    onConfirm(payments);
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case "cash": return <Banknote size={16} />;
      case "card": return <CreditCard size={16} />;
      case "tabby":
      case "tamara": return <Smartphone size={16} />;
      case "insurance": return <ShieldPlus size={16} />;
      default: return <Banknote size={16} />;
    }
  };

  const methodOptions: { value: PaymentMethodType; label: string }[] = [
    { value: "cash", label: "كاش" },
    { value: "card", label: "شبكة" },
    { value: "tabby", label: "تابي" },
    { value: "tamara", label: "تمارا" },
    { value: "insurance", label: "تغطية تأمين" },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-xl bg-white dark:bg-gray-900">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            دفع مجزأ (Split Payment)
          </DialogTitle>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
            <div>
              <p className="text-sm text-gray-500">الإجمالي المطلوب</p>
              <p className="text-2xl font-bold">{grandTotal.toFixed(2)} ر.س</p>
            </div>
            <div className="text-left">
              <p className="text-sm text-gray-500">المتبقي</p>
              <p className={`text-2xl font-bold ${remaining > 0 ? "text-orange-500" : remaining < 0 ? "text-red-500" : "text-emerald-500"}`}>
                {remaining.toFixed(2)} ر.س
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {payments.map((payment, index) => (
              <div key={payment.id} className="flex items-center gap-2">
                <div className="flex-1 flex gap-2">
                  <select 
                    className="flex-1 h-12 px-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary outline-none"
                    value={payment.method}
                    onChange={(e) => handleMethodChange(payment.id, e.target.value as PaymentMethodType)}
                  >
                    {methodOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                  <div className="relative flex-1">
                    <Input 
                      type="number"
                      min="0"
                      step="0.01"
                      className="h-12 text-lg font-bold pl-12"
                      value={payment.amount || ""}
                      onChange={(e) => handleAmountChange(payment.id, parseFloat(e.target.value) || 0)}
                    />
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">ر.س</span>
                  </div>
                </div>
                
                {payments.length > 1 && (
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-12 w-12 text-red-500 hover:text-red-600 hover:bg-red-50"
                    onClick={() => handleRemovePayment(payment.id)}
                  >
                    <Trash2 size={20} />
                  </Button>
                )}
              </div>
            ))}
          </div>

          <Button 
            variant="outline" 
            className="w-full border-dashed h-12 gap-2 text-primary hover:text-primary/80"
            onClick={handleAddPayment}
            disabled={remaining <= 0}
          >
            <Plus size={18} />
            إضافة طريقة دفع أخرى
          </Button>

        </div>

        <div className="flex gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
          <Button variant="outline" className="flex-1 h-12" onClick={onClose}>إلغاء</Button>
          <Button 
            className="flex-1 h-12 font-bold text-lg" 
            onClick={handleConfirm}
            disabled={Math.abs(remaining) > 0.01}
          >
            تأكيد الدفع
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

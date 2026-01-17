"use client";

import React, { useState, useMemo } from "react";
import {
  ArrowLeftRight,
  Warehouse,
  Package,
  Check,
  Loader2,
  ArrowLeft,
  ArrowRight,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/src/shared/components/shadcn/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/src/shared/components/shadcn/ui/card";
import { useTransferFormStore } from "../store";
import { safeToast } from "@/src/shared/utils/safeToast";
import { useRouter } from "next/navigation";
import api from "@/src/shared/api/axios";

// Step Components
import { BranchesStep } from "./steps/BranchesStep";
import { ItemsStep } from "./steps/ItemsStep";
import { TransferReviewStep } from "./steps/TransferReviewStep";

// Step Indicator
const StepIndicator = ({
  steps,
  currentStep,
}: {
  steps: { id: number; title: string; icon: React.ReactNode }[];
  currentStep: number;
}) => (
  <div className="flex items-center justify-center gap-2 mb-8">
    {steps.map((step, index) => (
      <React.Fragment key={step.id}>
        <div
          className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
            currentStep === step.id
              ? "bg-primary text-white"
              : currentStep > step.id
              ? "bg-green-500 text-white"
              : "bg-gray-100 dark:bg-gray-800 text-gray-500"
          }`}
        >
          {step.icon}
          <span className="text-sm font-medium hidden md:inline">
            {step.title}
          </span>
        </div>
        {index < steps.length - 1 && (
          <div
            className={`h-0.5 w-8 ${
              currentStep > step.id ? "bg-green-500" : "bg-gray-300"
            }`}
          />
        )}
      </React.Fragment>
    ))}
  </div>
);

const STEPS = [
  { id: 1, title: "الفروع", icon: <Warehouse size={18} /> },
  { id: 2, title: "المنتجات", icon: <Package size={18} /> },
  { id: 3, title: "المراجعة", icon: <Check size={18} /> },
];

export function CreateTransfer() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const store = useTransferFormStore();

  // Step validation
  const canProceedToStep2 = useMemo(
    () =>
      !!store.fromBranchId &&
      !!store.toBranchId &&
      store.fromBranchId !== store.toBranchId,
    [store.fromBranchId, store.toBranchId]
  );

  const canProceedToStep3 = useMemo(
    () => store.items.length > 0,
    [store.items]
  );

  const handleNext = () => {
    if (currentStep < 3) setCurrentStep((prev) => prev + 1);
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep((prev) => prev - 1);
  };

  const handleSubmit = async () => {
    if (!store.fromBranchId || !store.toBranchId) {
      safeToast("يجب اختيار الفروع", { type: "error" });
      return;
    }

    if (store.items.length === 0) {
      safeToast("يجب إضافة منتج واحد على الأقل", { type: "error" });
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        from_branch: store.fromBranchId,
        to_branch: store.toBranchId,
        notes: store.notes,
        items: store.items.map((item) => ({
          variant: item.variantId,
          quantity_requested: item.quantityRequested,
          unit_cost: item.unitCost,
        })),
      };

      await api.customRequest("products_stock-transfers_create", payload);

      safeToast("تم إنشاء طلب التحويل بنجاح", { type: "success" });
      store.reset();
      router.push("/dashboard/inventory/transfers");
    } catch (error: any) {
      const message =
        error?.response?.data?.detail ||
        error?.response?.data?.error ||
        Object.values(error?.response?.data || {})
          .flat()
          .join(", ") ||
        "فشل في إنشاء طلب التحويل";
      safeToast(message, { type: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return canProceedToStep2;
      case 2:
        return canProceedToStep3;
      default:
        return true;
    }
  };

  return (
    <div className="min-h-screen bg-body py-8">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white mb-4 shadow-lg shadow-blue-500/30">
            <ArrowLeftRight className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold text-main">تحويل مخزون</h1>
          <p className="text-secondary mt-2">
            نقل المخزون بين الفروع والمستودعات
          </p>
        </div>

        {/* Info Banner */}
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-blue-800 dark:text-blue-200 font-medium">
              كيف تعمل التحويلات؟
            </p>
            <p className="text-blue-700 dark:text-blue-300 text-sm">
              1. أنشئ طلب التحويل → 2. قدّم الطلب للموافقة → 3. شحن المخزون → 4.
              استلام المخزون في الفرع المستلم
            </p>
          </div>
        </div>

        {/* Step Indicator */}
        <StepIndicator steps={STEPS} currentStep={currentStep} />

        {/* Form Card */}
        <Card className="shadow-xl border-0 bg-elevated">
          <CardHeader>
            <CardTitle className="text-xl">
              {STEPS[currentStep - 1].title}
            </CardTitle>
            <CardDescription>
              {currentStep === 1 && "اختر الفرع المرسل والفرع المستلم"}
              {currentStep === 2 && "أضف المنتجات التي تريد تحويلها"}
              {currentStep === 3 && "راجع البيانات قبل إنشاء طلب التحويل"}
            </CardDescription>
          </CardHeader>

          <CardContent>
            {/* Step Content */}
            {currentStep === 1 && <BranchesStep />}
            {currentStep === 2 && <ItemsStep />}
            {currentStep === 3 && <TransferReviewStep />}

            {/* Navigation */}
            <div className="flex justify-between mt-8 pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === 1}
              >
                <ArrowRight className="w-4 h-4 ml-2" />
                السابق
              </Button>

              {currentStep < 3 ? (
                <Button
                  type="button"
                  onClick={handleNext}
                  disabled={!canProceed()}
                  className="bg-primary hover:bg-primary/90"
                >
                  التالي
                  <ArrowLeft className="w-4 h-4 mr-2" />
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting || !canProceed()}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin ml-2" />
                      جاري الإنشاء...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 ml-2" />
                      إنشاء طلب التحويل
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Transfer Summary */}
        <TransferSummary />
      </div>
    </div>
  );
}

// Summary Component
function TransferSummary() {
  const store = useTransferFormStore();

  if (!store.fromBranchId && store.items.length === 0) return null;

  return (
    <Card className="mt-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <ArrowLeftRight size={20} />
          ملخص التحويل
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {store.fromBranchName && (
          <div className="flex justify-between text-sm">
            <span className="text-secondary">من:</span>
            <span className="font-medium">{store.fromBranchName}</span>
          </div>
        )}
        {store.toBranchName && (
          <div className="flex justify-between text-sm">
            <span className="text-secondary">إلى:</span>
            <span className="font-medium">{store.toBranchName}</span>
          </div>
        )}
        <div className="flex justify-between text-sm">
          <span className="text-secondary">عدد المنتجات:</span>
          <span className="font-medium">{store.totalItems}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-secondary">إجمالي الكميات:</span>
          <span className="font-medium">{store.totalQuantity}</span>
        </div>
        {store.totalValue > 0 && (
          <div className="flex justify-between text-lg font-bold border-t pt-3">
            <span>القيمة التقديرية:</span>
            <span className="text-primary">
              {store.totalValue.toFixed(2)} ر.س
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default CreateTransfer;

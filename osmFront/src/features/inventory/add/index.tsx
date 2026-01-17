"use client";

import React, { useState, useMemo } from "react";
import {
  Package,
  Warehouse,
  ArrowUpCircle,
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
import { useInventoryFormStore, useTransferFormStore } from "../store";
import { safeToast } from "@/src/shared/utils/safeToast";
import { useRouter } from "next/navigation";
import api from "@/src/shared/api/axios";

// Step Components
import { BranchStep } from "./steps/BranchStep";
import { ProductStep } from "./steps/ProductStep";
import { MovementStep } from "./steps/MovementStep";
import { ReviewStep } from "./steps/ReviewStep";

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
  { id: 1, title: "المستودع", icon: <Warehouse size={18} /> },
  { id: 2, title: "المنتج", icon: <Package size={18} /> },
  { id: 3, title: "الحركة", icon: <ArrowUpCircle size={18} /> },
  { id: 4, title: "المراجعة", icon: <Check size={18} /> },
];

export function AddInventory() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const store = useInventoryFormStore();

  // Step validation
  const canProceedToStep2 = useMemo(() => !!store.branchId, [store.branchId]);

  const canProceedToStep3 = useMemo(
    () => !!store.variantId || !!store.stockId,
    [store.variantId, store.stockId]
  );

  const canProceedToStep4 = useMemo(() => {
    if (store.movementType === "purchase") {
      return store.quantity > 0 && store.costPerUnit > 0;
    }
    return store.quantity > 0;
  }, [store.movementType, store.quantity, store.costPerUnit]);

  const handleNext = () => {
    if (currentStep < 4) setCurrentStep((prev) => prev + 1);
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep((prev) => prev - 1);
  };

  const handleSubmit = async () => {
    if (!store.stockId && !store.variantId) {
      safeToast("يجب اختيار المنتج", { type: "error" });
      return;
    }

    if (store.quantity <= 0) {
      safeToast("يجب إدخال كمية صحيحة", { type: "error" });
      return;
    }

    if (store.movementType === "purchase" && store.costPerUnit <= 0) {
      safeToast("يجب إدخال سعر الشراء", { type: "error" });
      return;
    }

    setIsSubmitting(true);
    try {
      // If no stock exists, create one first
      let stockId = store.stockId;

      if (!stockId && store.variantId && store.branchId) {
        // Create stock record first
        const stockResponse = await api.customRequest(
          "products_stocks_create",
          {
            branch: store.branchId,
            variant: store.variantId,
            quantity_in_stock: 0,
            reorder_level: 5,
          }
        );
        stockId = stockResponse.id;
      }

      if (!stockId) {
        safeToast("فشل في إعداد المخزون", { type: "error" });
        return;
      }

      // Create movement
      const payload = {
        stock: stockId,
        movement_type: store.movementType,
        quantity: store.quantity,
        cost_per_unit: store.costPerUnit || 0,
        reference_number: store.referenceNumber,
        notes: store.notes,
      };

      await api.customRequest("products_stock-movements_create", payload);

      safeToast("تم إضافة حركة المخزون بنجاح", { type: "success" });
      store.reset();
      router.push("/dashboard/inventory");
    } catch (error: any) {
      const message =
        error?.response?.data?.detail ||
        error?.response?.data?.error ||
        Object.values(error?.response?.data || {})
          .flat()
          .join(", ") ||
        "فشل في إضافة حركة المخزون";
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
      case 3:
        return canProceedToStep4;
      default:
        return true;
    }
  };

  return (
    <div className="min-h-screen bg-body py-8">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white mb-4 shadow-lg shadow-emerald-500/30">
            <Package className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold text-main">إضافة حركة مخزون</h1>
          <p className="text-secondary mt-2">
            سجل حركات الشراء والتعديل والخسائر
          </p>
        </div>

        {/* Warning for non-store branches */}
        <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-amber-800 dark:text-amber-200 font-medium">
              ملاحظة هامة
            </p>
            <p className="text-amber-700 dark:text-amber-300 text-sm">
              يمكن إضافة المخزون فقط للفروع من نوع &quot;مستودع&quot; (Store).
              الفروع العادية تستلم المخزون عن طريق التحويلات.
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
              {currentStep === 1 && "اختر المستودع الذي ستضيف له المخزون"}
              {currentStep === 2 && "اختر المنتج الذي تريد إضافة حركة له"}
              {currentStep === 3 && "حدد نوع الحركة والكمية والتكلفة"}
              {currentStep === 4 && "راجع البيانات قبل الحفظ"}
            </CardDescription>
          </CardHeader>

          <CardContent>
            {/* Step Content */}
            {currentStep === 1 && <BranchStep />}
            {currentStep === 2 && <ProductStep />}
            {currentStep === 3 && <MovementStep />}
            {currentStep === 4 && <ReviewStep />}

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

              {currentStep < 4 ? (
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
                      جاري الحفظ...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 ml-2" />
                      تأكيد الحركة
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Summary Card */}
        <InventorySummary />
      </div>
    </div>
  );
}

// Summary Component
function InventorySummary() {
  const store = useInventoryFormStore();

  const movementTypeLabels: Record<string, string> = {
    purchase: "شراء / إعادة تخزين",
    adjustment: "تعديل المخزون",
    damage: "تلف / خسارة",
    return: "مرتجع من عميل",
  };

  if (!store.branchId && !store.variantId) return null;

  return (
    <Card className="mt-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Package size={20} />
          ملخص الحركة
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {store.branchName && (
          <div className="flex justify-between text-sm">
            <span className="text-secondary">المستودع:</span>
            <span className="font-medium">{store.branchName}</span>
          </div>
        )}
        {store.variantName && (
          <div className="flex justify-between text-sm">
            <span className="text-secondary">المنتج:</span>
            <span className="font-medium">{store.variantName}</span>
          </div>
        )}
        {store.movementType && (
          <div className="flex justify-between text-sm">
            <span className="text-secondary">نوع الحركة:</span>
            <span className="font-medium">
              {movementTypeLabels[store.movementType] || store.movementType}
            </span>
          </div>
        )}
        {store.quantity > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-secondary">الكمية:</span>
            <span className="font-medium text-primary">{store.quantity}</span>
          </div>
        )}
        {store.costPerUnit > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-secondary">سعر الوحدة:</span>
            <span className="font-medium">
              {store.costPerUnit.toFixed(2)} ر.س
            </span>
          </div>
        )}
        {store.quantity > 0 && store.costPerUnit > 0 && (
          <div className="flex justify-between text-lg font-bold border-t pt-3">
            <span>الإجمالي:</span>
            <span className="text-primary">
              {(store.quantity * store.costPerUnit).toFixed(2)} ر.س
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default AddInventory;

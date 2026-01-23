"use client";

import React, { useState, useMemo } from "react";
import {
  ShoppingCart,
  User,
  Package,
  CreditCard,
  FileText,
  Check,
  Loader2,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";
import { Form } from "@/src/shared/components/shadcn/ui/form";
import { Button } from "@/src/shared/components/shadcn/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/src/shared/components/shadcn/ui/card";
import { useApiForm } from "@/src/shared/hooks/useApiForm";
import { useOrderFormStore } from "../store/useOrderFormStore";
import { safeToast } from "@/src/shared/utils/safeToast";
import { useRouter } from "next/navigation";


// Step Components
import { CustomerStep } from "./steps/CustomerStep";
import { PrescriptionStep } from "./steps/PrescriptionStep";
import { ProductsStep } from "./steps/ProductsStep";
import { PaymentStep } from "./steps/PaymentStep";

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
  { id: 1, title: "العميل", icon: <User size={18} /> },
  { id: 2, title: "الوصفة", icon: <FileText size={18} /> },
  { id: 3, title: "المنتجات", icon: <Package size={18} /> },
  { id: 4, title: "الدفع", icon: <CreditCard size={18} /> },
];

export function CreateOrder() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const router = useRouter();
  const store = useOrderFormStore();

  // جلب بيانات المستخدم الحالي لتحديد الفرع ومندوب المبيعات تلقائياً
  const { query: userQuery } = useApiForm({
    alias: "users_profile_retrieve",
    enabled: true,
  });

  const currentUser = userQuery.data;

  // تحديد الفرع ومندوب المبيعات تلقائياً
  React.useEffect(() => {
    if (currentUser?.branch_user) {
      store.setBranch(currentUser.branch_user.branch);
      store.setSalesPerson(currentUser.branch_user.id);
    }
  }, [currentUser, store]);

  const form = useApiForm({
    alias: "sales_orders_create",
    onSuccess: (data) => {
      safeToast("تم إنشاء الطلب بنجاح", { type: "success" });
      store.reset();
      router.push(`/dashboard/orders/${data.id}`);
    },
    onError: (error) => {
      safeToast(`فشل في إنشاء الطلب: ${error?.message || "خطأ غير معروف"}`, {
        type: "error",
      });
    },
  });

  // Step validation
  const canProceedToStep2 = useMemo(
    () => !!store.customerId,
    [store.customerId],
  );
  const canProceedToStep3 = useMemo(
    () => !!store.customerId,
    [store.customerId],
  ); // Prescription is optional
  const canProceedToStep4 = useMemo(
    () => store.items.length > 0,
    [store.items],
  );

  const handleNext = () => {
    if (currentStep < 4) setCurrentStep((prev) => prev + 1);
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep((prev) => prev - 1);
  };

  const handleSubmit = async () => {
    if (!store.customerId) {
      safeToast("يجب اختيار العميل", { type: "error" });
      setCurrentStep(1);
      return;
    }

    if (store.items.length === 0) {
      safeToast("يجب إضافة منتج واحد على الأقل", { type: "error" });
      setCurrentStep(3);
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        customer: store.customerId,
        branch: store.branchId,
        sales_person: store.salesPersonId,
        order_type: store.orderType,
        payment_method: store.paymentMethodId,
        discount_amount: store.discountAmount.toFixed(2),
        tax_rate: store.taxRate.toFixed(4),
        paid_amount: store.paidAmount.toFixed(2),
        notes: store.notes,
        internal_notes: store.internalNotes,
        expected_delivery: store.expectedDelivery,
        items: store.items.map((item) => ({
          product_variant: item.product_variant,
          quantity: item.quantity,
          unit_price: item.unit_price.toFixed(2),
          prescription: item.prescription || store.prescriptionId,
        })),
      };

      await form.submitForm(payload);
    } catch (error: any) {
      console.error("Order creation error:", error);

      // معالجة الأخطاء من Backend
      if (error?.response?.data) {
        const errors = error.response.data;

        // إذا كان الخطأ في العناصر
        if (errors.items || errors.non_field_errors) {
          const errorMsg = Array.isArray(errors.items)
            ? errors.items.join(", ")
            : Array.isArray(errors.non_field_errors)
            ? errors.non_field_errors.join(", ")
            : String(errors.items || errors.non_field_errors);
          safeToast(errorMsg, { type: "error" });
          setCurrentStep(3); // الرجوع لخطوة المنتجات
        }
        // إذا كان الخطأ في العميل
        else if (errors.customer) {
          const errorMsg = Array.isArray(errors.customer)
            ? errors.customer.join(", ")
            : String(errors.customer);
          safeToast(errorMsg, { type: "error" });
          setCurrentStep(1);
        }
        // إذا كان الخطأ في الدفع
        else if (
          errors.discount_amount ||
          errors.paid_amount ||
          errors.payment_method
        ) {
          const errorMsg = String(
            errors.discount_amount || errors.paid_amount || errors.payment_method,
          );
          safeToast(errorMsg, { type: "error" });
          setCurrentStep(4);
        }
        // أخطاء عامة
        else if (typeof errors === "object") {
          Object.entries(errors).forEach(([field, messages]) => {
            const errorMsg = Array.isArray(messages)
              ? messages.join(", ")
              : String(messages);
            safeToast(`${field}: ${errorMsg}`, { type: "error" });
          });
        } else {
          safeToast(String(errors), { type: "error" });
        }
      } else {
        safeToast(error?.message || "حدث خطأ غير متوقع أثناء إنشاء الطلب", {
          type: "error",
        });
      }
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
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-blue-600 text-white mb-4 shadow-lg shadow-primary/30">
            <ShoppingCart className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold text-main">إنشاء طلب جديد</h1>
          <p className="text-secondary mt-2">أدخل بيانات الطلب خطوة بخطوة</p>
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
              {currentStep === 1 && "اختر العميل المطلوب"}
              {currentStep === 2 && "اختر الوصفة الطبية أو أدخل وصفة جديدة"}
              {currentStep === 3 && "أضف المنتجات وحدد الكميات والأسعار"}
              {currentStep === 4 && "حدد نوع الطلب وطريقة الدفع والخصم"}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Form {...form}>
              {/* Step Content */}
              {currentStep === 1 && <CustomerStep />}
              {currentStep === 2 && <PrescriptionStep />}
              {currentStep === 3 && <ProductsStep />}
              {currentStep === 4 && <PaymentStep />}

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
                        جاري الإنشاء...
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4 ml-2" />
                        تأكيد الطلب
                      </>
                    )}
                  </Button>
                )}
              </div>
            </Form>
          </CardContent>

          
        </Card>

        {/* Order Summary (sticky on desktop) */}
        <div className="mt-6">
          <OrderSummary />
        </div>
      </div>
    </div>
  );
}

// Order Summary Component
function OrderSummary() {
  const store = useOrderFormStore();

  return (
    <Card className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <ShoppingCart size={20} />
          ملخص الطلب
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {store.customerName && (
          <div className="flex justify-between text-sm">
            <span className="text-secondary">العميل:</span>
            <span className="font-medium">{store.customerName}</span>
          </div>
        )}
        <div className="flex justify-between text-sm">
          <span className="text-secondary">عدد المنتجات:</span>
          <span className="font-medium">{store.items.length}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-secondary">المجموع الفرعي:</span>
          <span className="font-medium">{store.subtotal.toFixed(2)} ر.س</span>
        </div>
        {store.discountAmount > 0 && (
          <div className="flex justify-between text-sm text-green-600">
            <span>الخصم:</span>
            <span>-{store.discountAmount.toFixed(2)} ر.س</span>
          </div>
        )}
        <div className="flex justify-between text-sm">
          <span className="text-secondary">
            الضريبة ({(store.taxRate * 100).toFixed(0)}%):
          </span>
          <span className="font-medium">{store.taxAmount.toFixed(2)} ر.س</span>
        </div>
        <div className="flex justify-between text-lg font-bold border-t pt-3">
          <span>الإجمالي:</span>
          <span className="text-primary">
            {store.totalAmount.toFixed(2)} ر.س
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

export default CreateOrder;

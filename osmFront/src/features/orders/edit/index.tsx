"use client";

import React, { useState, useMemo, useEffect } from "react";
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
  AlertCircle,
  ClipboardCheck,
  Truck,
  XCircle,
  Clock,
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
import { Loading4 } from "@/src/shared/components/ui/loding";

// Step Components
import { CustomerStep } from "../create/steps/CustomerStep";
import { PrescriptionStep } from "../create/steps/PrescriptionStep";
import { ProductsStep } from "../create/steps/ProductsStep";
import { PaymentStep } from "../create/steps/PaymentStep";

// Status options
const ORDER_STATUS_OPTIONS = [
  {
    value: "pending",
    label: "قيد الانتظار",
    icon: Clock,
    color: "text-yellow-500 bg-yellow-50",
  },
  {
    value: "confirmed",
    label: "مؤكد",
    icon: ClipboardCheck,
    color: "text-blue-500 bg-blue-50",
  },
  {
    value: "ready",
    label: "جاهز",
    icon: Package,
    color: "text-purple-500 bg-purple-50",
  },
  {
    value: "delivered",
    label: "تم التسليم",
    icon: Truck,
    color: "text-green-500 bg-green-50",
  },
  {
    value: "cancelled",
    label: "ملغي",
    icon: XCircle,
    color: "text-red-500 bg-red-50",
  },
];

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

interface EditOrderProps {
  orderId: number;
}

export function EditOrder({ orderId }: EditOrderProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const store = useOrderFormStore();

  // Fetch order data
  const orderQuery = useApiForm({
    alias: "sales_orders_retrieve",
    defaultValues: { id: orderId },
    enabled: !!orderId,
  });

  // Load order data into store
  useEffect(() => {
    if (orderQuery.query.data) {
      store.loadOrder(orderQuery.query.data);
      setIsLoading(false);
    }
  }, [orderQuery.query.data]);

  // Update form
  const form = useApiForm({
    alias: "sales_orders_update",
    onSuccess: (data) => {
      safeToast("تم تحديث الطلب بنجاح", { type: "success" });
      router.push(`/dashboard/orders/${data.id}`);
    },
    onError: (error) => {
      safeToast(`فشل في تحديث الطلب: ${error?.message || "خطأ غير معروف"}`, {
        type: "error",
      });
    },
  });

  // Step validation
  const canProceedToStep2 = useMemo(
    () => !!store.customerId,
    [store.customerId]
  );
  const canProceedToStep3 = useMemo(
    () => !!store.customerId,
    [store.customerId]
  );
  const canProceedToStep4 = useMemo(
    () => store.items.length > 0,
    [store.items]
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
      return;
    }

    if (store.items.length === 0) {
      safeToast("يجب إضافة منتج واحد على الأقل", { type: "error" });
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        id: orderId,
        customer: store.customerId,
        branch: store.branchId,
        sales_person: store.salesPersonId,
        order_type: store.orderType,
        payment_type: store.paymentType,
        status: store.status,
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
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = (newStatus: any) => {
    store.setStatus(newStatus);
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-body flex items-center justify-center">
        <Loading4 />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-body py-8">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 text-white mb-4 shadow-lg shadow-blue-500/30">
            <ShoppingCart className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold text-main">
            تعديل الطلب #{store.orderNumber}
          </h1>
          <p className="text-secondary mt-2">
            تعديل بيانات الطلب وتحديث الحالة
          </p>
        </div>

        {/* Status Change Card */}
        <Card className="mb-6 border-2 border-dashed">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <ClipboardCheck size={20} />
              حالة الطلب
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {ORDER_STATUS_OPTIONS.map((option) => {
                const Icon = option.icon;
                const isActive = store.status === option.value;
                return (
                  <button
                    key={option.value}
                    onClick={() => handleStatusChange(option.value)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all ${
                      isActive
                        ? `${option.color} border-current font-medium`
                        : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
                    }`}
                  >
                    <Icon size={18} />
                    <span>{option.label}</span>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Step Indicator */}
        <StepIndicator steps={STEPS} currentStep={currentStep} />

        {/* Form Card */}
        <Card className="shadow-xl border-0 bg-elevated">
          <CardHeader>
            <CardTitle className="text-xl">
              {STEPS[currentStep - 1].title}
            </CardTitle>
            <CardDescription>
              {currentStep === 1 && "تعديل بيانات العميل والفرع"}
              {currentStep === 2 && "تعديل الوصفة الطبية"}
              {currentStep === 3 && "تعديل المنتجات والكميات"}
              {currentStep === 4 && "تعديل الدفع والخصم"}
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
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin ml-2" />
                        جاري الحفظ...
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4 ml-2" />
                        حفظ التغييرات
                      </>
                    )}
                  </Button>
                )}
              </div>
            </Form>
          </CardContent>
        </Card>

        {/* Order Summary */}
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
        {store.orderNumber && (
          <div className="flex justify-between text-sm">
            <span className="text-secondary">رقم الطلب:</span>
            <span className="font-medium">{store.orderNumber}</span>
          </div>
        )}
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

export default EditOrder;

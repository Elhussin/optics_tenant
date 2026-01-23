import React, { useState } from "react";
import {
  Check,
  Package,
  Truck,
  Plus,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { ActionButton } from "@/src/shared/components/ui/buttons";
import { ConfirmDialog } from "@/src/shared/components/ui/dialogs/ConfirmDialog";
import { useApiForm } from "@/src/shared/hooks/useApiForm";
import { safeToast } from "@/src/shared/utils/safeToast";

interface OrderActionsProps {
  orderId: number;
  status: string;
  paymentStatus: string;
  remainingAmount: number;
  onActionComplete: () => void;
}

export function OrderActions({
  orderId,
  status,
  paymentStatus,
  remainingAmount,
  onActionComplete,
}: OrderActionsProps) {
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    action: "confirm" | "ready" | "deliver" | null;
  }>({ open: false, action: null });

  const confirmMutation = useApiForm({
    alias: "sales_orders_confirm_create",
    showToast: false,
  });

  const readyMutation = useApiForm({
    alias: "sales_orders_ready_create",
    showToast: false,
  });

  const deliverMutation = useApiForm({
    alias: "sales_orders_deliver_create",
    showToast: false,
  });

  const handleAction = async (action: "confirm" | "ready" | "deliver") => {
    setConfirmDialog({ open: true, action });
  };

  const executeAction = async () => {
    const { action } = confirmDialog;
    if (!action) return;

    try {
      let result;
      switch (action) {
        case "confirm":
          result = await confirmMutation.mutation.mutateAsync({ id: orderId });
          safeToast("تم تأكيد الطلب بنجاح", { type: "success" });
          break;
        case "ready":
          result = await readyMutation.mutation.mutateAsync({ id: orderId });
          safeToast("تم تجهيز الطلب للتسليم", { type: "success" });
          break;
        case "deliver":
          result = await deliverMutation.mutation.mutateAsync({ id: orderId });
          safeToast("تم تسليم الطلب وإنشاء الفاتورة", { type: "success" });
          break;
      }
      onActionComplete();
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.detail ||
        error?.response?.data?.message ||
        error?.message ||
        "حدث خطأ أثناء تنفيذ العملية";
      safeToast(errorMessage, { type: "error" });
    } finally {
      setConfirmDialog({ open: false, action: null });
    }
  };

  const isPending =
    confirmMutation.mutation.isPending ||
    readyMutation.mutation.isPending ||
    deliverMutation.mutation.isPending;

  const showConfirmButton = status === "pending";
  const showReadyButton = status === "confirmed";
  const showDeliverButton = status === "ready" || status === "confirmed";
  const showAddPaymentButton = remainingAmount > 0 && status !== "cancelled";

  const getActionMessage = () => {
    switch (confirmDialog.action) {
      case "confirm":
        return "هل أنت متأكد من تأكيد الطلب؟ سيتم حجز المخزون.";
      case "ready":
        return "هل أنت متأكد من تجهيز الطلب للتسليم؟";
      case "deliver":
        return "هل أنت متأكد من تسليم الطلب؟ سيتم خصم المخزون وإنشاء الفاتورة تلقائياً.";
      default:
        return "";
    }
  };

  if (
    !showConfirmButton &&
    !showReadyButton &&
    !showDeliverButton &&
    !showAddPaymentButton
  ) {
    return null;
  }

  return (
    <>
      <div className="flex flex-wrap gap-3 p-4 rounded-xl bg-gradient-to-br from-primary/5 to-blue-50 dark:from-primary/10 dark:to-gray-800 border border-primary/20">
        <div className="w-full mb-2">
          <p className="text-sm font-semibold text-secondary flex items-center gap-2">
            <AlertCircle size={16} className="text-primary" />
            الإجراءات المتاحة
          </p>
        </div>

        {showConfirmButton && (
          <ActionButton
            variant="primary"
            icon={
              isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Check className="w-4 h-4" />
              )
            }
            label="تأكيد الطلب"
            onClick={() => handleAction("confirm")}
            disabled={isPending}
            className="shadow-lg shadow-primary/20"
          />
        )}

        {showReadyButton && (
          <ActionButton
            variant="info"
            icon={
              isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Package className="w-4 h-4" />
              )
            }
            label="جاهز للتسليم"
            onClick={() => handleAction("ready")}
            disabled={isPending}
            className="shadow-lg shadow-blue-500/20"
          />
        )}

        {showDeliverButton && (
          <ActionButton
            variant="success"
            icon={
              isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Truck className="w-4 h-4" />
              )
            }
            label="تسليم الطلب"
            onClick={() => handleAction("deliver")}
            disabled={isPending}
            className="shadow-lg shadow-green-500/20"
          />
        )}

        {showAddPaymentButton && (
          <ActionButton
            variant="secondary"
            icon={<Plus className="w-4 h-4" />}
            label={`إضافة دفعة (متبقي: ${remainingAmount.toFixed(2)} ر.س)`}
            navigateTo={`/dashboard/payments/create?order=${orderId}`}
            className="shadow-lg"
          />
        )}
      </div>

      <ConfirmDialog
        open={confirmDialog.open}
        title="تأكيد العملية"
        message={getActionMessage()}
        onCancel={() => setConfirmDialog({ open: false, action: null })}
        onConfirm={executeAction}
        confirmText="تأكيد"
        cancelText="إلغاء"
        isDanger={false}
      />
    </>
  );
}

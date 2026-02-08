"use client";

import React from "react";
import {
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  Package,
  ArrowLeft,
  Edit3,
  Loader2,
  User,
  Calendar,
  Building2,
  DollarSign,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import useSWR from "swr";
import { Button } from "@/src/shared/components/shadcn/ui/button";
import { GlassCard } from "@/src/shared/components/ui/GlassCard";
import { ActionButton } from "@/src/shared/components/ui/buttons";
import api from "@/src/shared/api/axios";
import { safeToast } from "@/src/shared/utils/safeToast";
import { useApiForm } from "@/src/shared/hooks/useApiForm";
import { useTranslations } from "next-intl";

interface PurchaseOrderItem {
  id: number;
  variant: number;
  variant_name: string;
  variant_sku: string;
  product_name: string;
  quantity_ordered: number;
  quantity_received: number;
  remaining_quantity: number;
  unit_cost: string;
  line_total: string;
  is_fully_received: boolean;
  notes: string;
}

interface PurchaseOrder {
  id: number;
  order_number: string;
  supplier: number;
  supplier_name: string;
  branch: number;
  branch_name: string;
  status: string;
  status_display: string;
  order_date: string;
  expected_date?: string;
  approved_date?: string;
  received_date?: string;
  subtotal: string;
  tax_amount: string;
  discount_amount: string;
  total_amount: string;
  notes: string;
  items: PurchaseOrderItem[];
  items_count: number;
  created_by_name: string;
  approved_by_name: string;
  created_at: string;
  updated_at: string;
}

const statusConfig: Record<
  string,
  { color: string; icon: React.ReactNode; bg: string; darkBg: string }
> = {
  draft: {
    color: "text-gray-600 dark:text-gray-400",
    icon: <FileText size={18} />,
    bg: "bg-gray-100",
    darkBg: "dark:bg-gray-800/50",
  },
  submitted: {
    color: "text-blue-600 dark:text-blue-400",
    icon: <Clock size={18} />,
    bg: "bg-blue-100",
    darkBg: "dark:bg-blue-900/30",
  },
  approved: {
    color: "text-green-600 dark:text-green-400",
    icon: <CheckCircle size={18} />,
    bg: "bg-green-100",
    darkBg: "dark:bg-green-900/30",
  },
  partially_received: {
    color: "text-amber-600 dark:text-amber-400",
    icon: <Package size={18} />,
    bg: "bg-amber-100",
    darkBg: "dark:bg-amber-900/30",
  },
  received: {
    color: "text-emerald-600 dark:text-emerald-400",
    icon: <Truck size={18} />,
    bg: "bg-emerald-100",
    darkBg: "dark:bg-emerald-900/30",
  },
  cancelled: {
    color: "text-red-600 dark:text-red-400",
    icon: <XCircle size={18} />,
    bg: "bg-red-100",
    darkBg: "dark:bg-red-900/30",
  },
};

// Editable statuses
const EDITABLE_STATUSES = ["draft"];

export function PurchaseOrderDetails() {
  const t = useTranslations("inventory");
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;

  // Fetch order details
  const {
    data: order,
    error,
    isLoading,
    mutate,
  } = useSWR<PurchaseOrder>(
    orderId ? `purchase_order_detail_${orderId}` : null,
    async () => {
      const response = await api.customRequest(
        "products_purchase_orders_retrieve",
        { id: orderId },
      );
      return response;
    },
    { revalidateOnFocus: false },
  );

  // Action mutations
  const submitMutation = useApiForm({
    alias: "products_purchase_orders_submit_create",
    showToast: false,
  });
  const approveMutation = useApiForm({
    alias: "products_purchase_orders_approve_create",
    showToast: false,
  });
  const cancelMutation = useApiForm({
    alias: "products_purchase_orders_cancel_create",
    showToast: false,
  });

  const handleAction = async (action: "submit" | "approve" | "cancel") => {
    const mutations = {
      submit: submitMutation,
      approve: approveMutation,
      cancel: cancelMutation,
    };
    const messages: Record<string, string> = {
      submit:
        t("purchaseOrders.actions.submitSuccess") || "تم تقديم الطلب بنجاح",
      approve:
        t("purchaseOrders.actions.approveSuccess") || "تمت الموافقة على الطلب",
      cancel: t("purchaseOrders.actions.cancelSuccess") || "تم إلغاء الطلب",
    };

    try {
      await mutations[action].mutation.mutateAsync({ id: orderId } as any);
      safeToast(messages[action], { type: "success" });
      mutate();
    } catch (error: any) {
      const message =
        error?.response?.data?.detail ||
        t(`purchaseOrders.actions.${action}Error`) ||
        "حدث خطأ";
      safeToast(message, { type: "error" });
    }
  };

  const getStatusBadge = (status: string, display: string) => {
    const config = statusConfig[status] || statusConfig.draft;
    return (
      <span
        className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-base font-semibold ${config.color} ${config.bg} ${config.darkBg}`}
      >
        {config.icon}
        {display}
      </span>
    );
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "-";
    return new Intl.DateTimeFormat("ar-SA", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(new Date(dateString));
  };

  const formatDateTime = (dateString: string | null | undefined) => {
    if (!dateString) return "-";
    return new Intl.DateTimeFormat("ar-SA", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(dateString));
  };

  const isEditable = order && EDITABLE_STATUSES.includes(order.status);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-body flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-primary animate-spin" />
          <p className="text-secondary">
            {t("common.loading") || "جاري التحميل..."}
          </p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-body flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center">
          <AlertCircle className="w-12 h-12 text-red-500" />
          <h2 className="text-xl font-semibold text-main">
            {t("purchaseOrders.details.loadError") || "فشل تحميل أمر الشراء"}
          </h2>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-primary text-white rounded-lg"
          >
            {t("common.back") || "العودة"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-body py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="rounded-full"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-main flex items-center gap-3">
                <FileText className="w-8 h-8 text-primary" />
                {order.order_number}
              </h1>
              <div className="flex items-center gap-3 mt-2">
                {getStatusBadge(
                  order.status,
                  t(`purchaseOrders.statuses.${order.status}`) ||
                    order.status_display,
                )}
                <span className="text-secondary text-sm">
                  {formatDateTime(order.created_at)}
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-2 mt-4 md:mt-0 flex-wrap">
            {/* Action Buttons based on status */}
            {order.status === "draft" && (
              <Button
                onClick={() => handleAction("submit")}
                disabled={submitMutation.mutation.isPending}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {submitMutation.mutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin ml-2" />
                ) : (
                  <Clock className="w-4 h-4 ml-2" />
                )}
                {t("purchaseOrders.actions.submit")}
              </Button>
            )}

            {order.status === "submitted" && (
              <Button
                onClick={() => handleAction("approve")}
                disabled={approveMutation.mutation.isPending}
                className="bg-green-600 hover:bg-green-700"
              >
                {approveMutation.mutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin ml-2" />
                ) : (
                  <CheckCircle className="w-4 h-4 ml-2" />
                )}
                {t("purchaseOrders.actions.approve")}
              </Button>
            )}

            {["draft", "submitted"].includes(order.status) && (
              <Button
                variant="destructive"
                onClick={() => handleAction("cancel")}
                disabled={cancelMutation.mutation.isPending}
              >
                {cancelMutation.mutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin ml-2" />
                ) : (
                  <XCircle className="w-4 h-4 ml-2" />
                )}
                {t("purchaseOrders.actions.cancel")}
              </Button>
            )}

            {isEditable && (
              <Link
                href={`/dashboard/stock-management/purchase-orders/${order.id}/edit`}
              >
                <Button variant="outline" className="gap-2">
                  <Edit3 className="w-4 h-4" />
                  {t("purchaseOrders.actions.edit") || "تعديل"}
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Order Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Supplier */}
          <GlassCard className="border-border-main/50">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-secondary">
                    {t("purchaseOrders.details.supplier") || "المورد"}
                  </p>
                  <h3 className="text-xl font-bold text-main">
                    {order.supplier_name}
                  </h3>
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Branch */}
          <GlassCard className="border-border-main/50">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <Package className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-secondary">
                    {t("purchaseOrders.details.branch") || "الفرع"}
                  </p>
                  <h3 className="text-xl font-bold text-main">
                    {order.branch_name}
                  </h3>
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Total */}
          <GlassCard className="border-border-main/50">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-secondary">
                    {t("purchaseOrders.details.total") || "الإجمالي"}
                  </p>
                  <h3 className="text-xl font-bold text-primary">
                    {Number(order.total_amount).toFixed(2)}{" "}
                    {t("info.currency") || "ر.س"}
                  </h3>
                </div>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Dates & Users */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Dates */}
          <GlassCard className="border-border-main/50">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-main mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                {t("purchaseOrders.details.dates") || "التواريخ"}
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-secondary">
                    {t("purchaseOrders.details.orderDate") || "تاريخ الطلب"}
                  </span>
                  <span className="font-medium text-main">
                    {formatDate(order.order_date)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-secondary">
                    {t("purchaseOrders.details.expectedDate") ||
                      "التاريخ المتوقع"}
                  </span>
                  <span className="font-medium text-main">
                    {formatDate(order.expected_date)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-secondary">
                    {t("purchaseOrders.details.approvedDate") ||
                      "تاريخ الموافقة"}
                  </span>
                  <span className="font-medium text-main">
                    {formatDate(order.approved_date)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-secondary">
                    {t("purchaseOrders.details.receivedDate") ||
                      "تاريخ الاستلام"}
                  </span>
                  <span className="font-medium text-main">
                    {formatDate(order.received_date)}
                  </span>
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Users */}
          <GlassCard className="border-border-main/50">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-main mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                {t("purchaseOrders.details.users") || "المستخدمون"}
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-surface border border-main/10">
                  <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <User className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-secondary">
                      {t("purchaseOrders.details.createdBy") || "أنشئ بواسطة"}
                    </p>
                    <p className="font-medium text-main">
                      {order.created_by_name || "-"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-surface border border-main/10">
                  <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <User className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs text-secondary">
                      {t("purchaseOrders.details.approvedBy") || "وافق عليه"}
                    </p>
                    <p className="font-medium text-main">
                      {order.approved_by_name || "-"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Notes */}
        {order.notes && (
          <GlassCard className="border-border-main/50 mb-6">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-main mb-3 flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                {t("purchaseOrders.details.notes") || "ملاحظات"}
              </h3>
              <p className="text-secondary">{order.notes}</p>
            </div>
          </GlassCard>
        )}

        {/* Items */}
        <GlassCard className="border-border-main/50">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-main mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-primary" />
              {t("purchaseOrders.details.items") || "المنتجات"} (
              {order.items?.length || 0})
            </h3>

            {order.items && order.items.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-body/50 border-b border-main/10">
                    <tr>
                      <th className="text-start py-3 px-4 text-sm font-semibold text-secondary">
                        {t("purchaseOrders.details.product") || "المنتج"}
                      </th>
                      <th className="text-start py-3 px-4 text-sm font-semibold text-secondary">
                        SKU
                      </th>
                      <th className="text-center py-3 px-4 text-sm font-semibold text-secondary">
                        {t("purchaseOrders.details.ordered") || "مطلوب"}
                      </th>
                      <th className="text-center py-3 px-4 text-sm font-semibold text-secondary">
                        {t("purchaseOrders.details.received") || "مستلم"}
                      </th>
                      <th className="text-end py-3 px-4 text-sm font-semibold text-secondary">
                        {t("purchaseOrders.details.unitCost") || "سعر الوحدة"}
                      </th>
                      <th className="text-end py-3 px-4 text-sm font-semibold text-secondary">
                        {t("purchaseOrders.details.lineTotal") || "الإجمالي"}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-main/5">
                    {order.items.map((item) => (
                      <tr
                        key={item.id}
                        className="hover:bg-body/30 transition-colors"
                      >
                        <td className="py-4 px-4">
                          <p className="font-semibold text-main">
                            {item.product_name}
                          </p>
                          <p className="text-sm text-secondary">
                            {item.variant_name}
                          </p>
                        </td>
                        <td className="py-4 px-4 text-sm text-secondary">
                          {item.variant_sku}
                        </td>
                        <td className="py-4 px-4 text-center">
                          <span className="text-lg font-bold text-blue-600">
                            {item.quantity_ordered}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <span
                            className={`text-lg font-bold ${
                              item.is_fully_received
                                ? "text-green-600"
                                : item.quantity_received > 0
                                ? "text-amber-600"
                                : "text-gray-400"
                            }`}
                          >
                            {item.quantity_received}
                          </span>
                          {item.remaining_quantity > 0 && (
                            <p className="text-xs text-secondary">
                              {t("purchaseOrders.details.remaining") || "متبقي"}
                              : {item.remaining_quantity}
                            </p>
                          )}
                        </td>
                        <td className="py-4 px-4 text-end font-medium">
                          {Number(item.unit_cost).toFixed(2)}
                        </td>
                        <td className="py-4 px-4 text-end font-bold text-primary">
                          {Number(item.line_total).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-body/30 border-t-2 border-main/10">
                    <tr>
                      <td
                        colSpan={5}
                        className="py-4 px-4 text-end font-semibold text-main"
                      >
                        {t("purchaseOrders.details.subtotal") ||
                          "المجموع الفرعي"}
                      </td>
                      <td className="py-4 px-4 text-end font-bold text-main">
                        {Number(order.subtotal).toFixed(2)}
                      </td>
                    </tr>
                    <tr>
                      <td
                        colSpan={5}
                        className="py-3 px-4 text-end text-secondary"
                      >
                        {t("purchaseOrders.details.tax") || "الضريبة"}
                      </td>
                      <td className="py-3 px-4 text-end text-main">
                        {Number(order.tax_amount || 0).toFixed(2)}
                      </td>
                    </tr>
                    <tr>
                      <td
                        colSpan={5}
                        className="py-3 px-4 text-end text-secondary"
                      >
                        {t("purchaseOrders.details.discount") || "الخصم"}
                      </td>
                      <td className="py-3 px-4 text-end text-main">
                        -{Number(order.discount_amount || 0).toFixed(2)}
                      </td>
                    </tr>
                    <tr className="border-t border-main/20">
                      <td
                        colSpan={5}
                        className="py-4 px-4 text-end text-lg font-bold text-main"
                      >
                        {t("purchaseOrders.details.grandTotal") ||
                          "الإجمالي الكلي"}
                      </td>
                      <td className="py-4 px-4 text-end text-xl font-bold text-primary">
                        {Number(order.total_amount).toFixed(2)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            ) : (
              <p className="text-secondary text-center py-8">
                {t("purchaseOrders.details.noItems") || "لا توجد منتجات"}
              </p>
            )}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}

export default PurchaseOrderDetails;

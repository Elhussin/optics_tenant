"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTranslations } from "next-intl";
import useSWR from "swr";
import {
  Plus,
  FileText,
  Package,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  Eye,
  Edit3,
  Loader2,
} from "lucide-react";
import { useApiForm } from "@/src/shared/hooks/useApiForm";
import { ActionButton } from "@/src/shared/components/ui/buttons";
import { safeToast } from "@/src/shared/utils/safeToast";
import api from "@/src/shared/api/axios";

interface PurchaseOrder {
  id: number;
  order_number: string;
  supplier_name: string;
  branch_name: string;
  status: string;
  status_display: string;
  order_date: string;
  expected_date?: string;
  total_amount: number;
  items_count: number;
  created_at: string;
}

const statusConfig: Record<
  string,
  { color: string; icon: React.ReactNode; bg: string; darkBg: string }
> = {
  draft: {
    color: "text-gray-600 dark:text-gray-400",
    icon: <FileText size={14} />,
    bg: "bg-gray-100",
    darkBg: "dark:bg-gray-800/50",
  },
  submitted: {
    color: "text-blue-600 dark:text-blue-400",
    icon: <Clock size={14} />,
    bg: "bg-blue-100",
    darkBg: "dark:bg-blue-900/30",
  },
  approved: {
    color: "text-green-600 dark:text-green-400",
    icon: <CheckCircle size={14} />,
    bg: "bg-green-100",
    darkBg: "dark:bg-green-900/30",
  },
  partially_received: {
    color: "text-amber-600 dark:text-amber-400",
    icon: <Package size={14} />,
    bg: "bg-amber-100",
    darkBg: "dark:bg-amber-900/30",
  },
  received: {
    color: "text-emerald-600 dark:text-emerald-400",
    icon: <Truck size={14} />,
    bg: "bg-emerald-100",
    darkBg: "dark:bg-emerald-900/30",
  },
  cancelled: {
    color: "text-red-600 dark:text-red-400",
    icon: <XCircle size={14} />,
    bg: "bg-red-100",
    darkBg: "dark:bg-red-900/30",
  },
};

// Editable statuses
const EDITABLE_STATUSES = ["draft"];

export default function PurchaseOrderList() {
  const t = useTranslations("inventory");
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState<string>("");

  // Fetch orders with useSWR for reactive filtering
  const {
    data: ordersData,
    error,
    isLoading,
    mutate,
  } = useSWR(
    ["purchase_orders_list", statusFilter],
    async () => {
      const params: Record<string, any> = {
        page_size: 100,
        ordering: "-created_at",
      };
      if (statusFilter) {
        params.status = statusFilter;
      }
      const response = await api.customRequest(
        "products_purchase_orders_list",
        params,
      );
      return response;
    },
    { revalidateOnFocus: false },
  );

  const orders: PurchaseOrder[] = useMemo(() => {
    const data = ordersData as any;
    return data?.results || data || [];
  }, [ordersData]);

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

  const handleAction = async (
    orderId: number,
    action: "submit" | "approve" | "cancel",
  ) => {
    const mutations = {
      submit: submitMutation,
      approve: approveMutation,
      cancel: cancelMutation,
    };

    try {
      await mutations[action].mutation.mutateAsync({ id: orderId } as any);
      safeToast(t(`purchaseOrders.actions.${action}Success`), {
        type: "success",
      });
      mutate(); // Refresh list
    } catch (error: any) {
      const message =
        error?.response?.data?.detail ||
        error?.message ||
        t(`purchaseOrders.actions.${action}Error`);
      safeToast(message, { type: "error" });
    }
  };

  const getStatusBadge = (status: string, display: string) => {
    const config = statusConfig[status] || statusConfig.draft;
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${config.color} ${config.bg} ${config.darkBg}`}
      >
        {config.icon}
        {display}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    return new Intl.DateTimeFormat("ar-SA", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(new Date(dateString));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-main">
            {t("purchaseOrders.title")}
          </h2>
          <p className="text-sm text-secondary">
            {t("purchaseOrders.description")}
          </p>
        </div>

        <ActionButton
          variant="primary"
          icon={<Plus size={18} />}
          label={t("purchaseOrders.createNew")}
          onClick={() =>
            router.push("/dashboard/stock-management/purchase-orders/create")
          }
          className="shadow-lg shadow-primary/20"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {[
          "",
          "draft",
          "submitted",
          "approved",
          "partially_received",
          "received",
          "cancelled",
        ].map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              statusFilter === status
                ? "bg-primary text-white shadow-lg shadow-primary/20"
                : "bg-card text-secondary hover:bg-body border border-main/10"
            }`}
          >
            {status
              ? t(`purchaseOrders.statuses.${status}`)
              : t("purchaseOrders.statuses.all")}
          </button>
        ))}
      </div>

      {/* Orders List */}
      <div className="bg-card rounded-2xl border border-main/10 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-4" />
            <p className="text-secondary">{t("common.loading")}</p>
          </div>
        ) : error ? (
          <div className="p-12 text-center">
            <XCircle className="w-16 h-16 mx-auto text-red-500/50 mb-4" />
            <p className="text-lg font-medium text-main mb-2">
              {t("common.error") || "Error loading data"}
            </p>
            <p className="text-secondary mb-6">
              {error?.message || t("common.tryAgain")}
            </p>
          </div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center">
            <Package className="w-16 h-16 mx-auto text-secondary/30 mb-4" />
            <p className="text-lg font-medium text-main mb-2">
              {statusFilter
                ? t("purchaseOrders.empty.filtered") ||
                  "No orders with this status"
                : t("purchaseOrders.empty.title")}
            </p>
            <p className="text-secondary mb-6">
              {statusFilter
                ? t("purchaseOrders.empty.tryOther") || "Try a different filter"
                : t("purchaseOrders.empty.description")}
            </p>
            {!statusFilter && (
              <ActionButton
                variant="primary"
                icon={<Plus size={18} />}
                label={t("purchaseOrders.createFirst")}
                onClick={() =>
                  router.push(
                    "/dashboard/stock-management/purchase-orders/create",
                  )
                }
              />
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-body/50 border-b border-main/10">
                <tr>
                  <th className="text-start py-4 px-6 text-sm font-semibold text-secondary">
                    {t("purchaseOrders.columns.orderNumber")}
                  </th>
                  <th className="text-start py-4 px-6 text-sm font-semibold text-secondary">
                    {t("purchaseOrders.columns.supplier")}
                  </th>
                  <th className="text-start py-4 px-6 text-sm font-semibold text-secondary">
                    {t("purchaseOrders.columns.branch")}
                  </th>
                  <th className="text-start py-4 px-6 text-sm font-semibold text-secondary">
                    {t("purchaseOrders.columns.status")}
                  </th>
                  <th className="text-start py-4 px-6 text-sm font-semibold text-secondary">
                    {t("purchaseOrders.columns.total")}
                  </th>
                  <th className="text-start py-4 px-6 text-sm font-semibold text-secondary">
                    {t("purchaseOrders.columns.items")}
                  </th>
                  <th className="text-end py-4 px-6 text-sm font-semibold text-secondary">
                    {t("purchaseOrders.columns.actions")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-main/5">
                {orders.map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-body/30 transition-colors"
                  >
                    <td className="py-4 px-6">
                      <p className="font-semibold text-main">
                        {order.order_number}
                      </p>
                      <p className="text-xs text-secondary">
                        {formatDate(order.order_date)}
                      </p>
                    </td>
                    <td className="py-4 px-6 text-main">
                      {order.supplier_name}
                    </td>
                    <td className="py-4 px-6 text-main">{order.branch_name}</td>
                    <td className="py-4 px-6">
                      {getStatusBadge(order.status, order.status_display)}
                    </td>
                    <td className="py-4 px-6 font-semibold text-primary">
                      {Number(order.total_amount).toFixed(2)}
                    </td>
                    <td className="py-4 px-6 text-main">{order.items_count}</td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-end gap-2">
                        {/* View button */}
                        <Link
                          href={`/dashboard/stock-management/purchase-orders/${order.id}`}
                        >
                          <button
                            className="p-2 hover:bg-body rounded-lg transition-colors"
                            title={t("common.view") || "View"}
                          >
                            <Eye size={18} className="text-secondary" />
                          </button>
                        </Link>

                        {/* Edit button for draft orders */}
                        {EDITABLE_STATUSES.includes(order.status) && (
                          <Link
                            href={`/dashboard/stock-management/purchase-orders/${order.id}/edit`}
                          >
                            <button
                              className="p-2 hover:bg-body rounded-lg transition-colors"
                              title={t("purchaseOrders.actions.edit") || "Edit"}
                            >
                              <Edit3 size={18} className="text-blue-500" />
                            </button>
                          </Link>
                        )}

                        {/* Submit action for draft */}
                        {order.status === "draft" && (
                          <ActionButton
                            variant="secondary"
                            size="sm"
                            label={t("purchaseOrders.actions.submit")}
                            onClick={() => handleAction(order.id, "submit")}
                            disabled={submitMutation.mutation.isPending}
                          />
                        )}

                        {/* Approve action for submitted */}
                        {order.status === "submitted" && (
                          <ActionButton
                            variant="primary"
                            size="sm"
                            label={t("purchaseOrders.actions.approve")}
                            onClick={() => handleAction(order.id, "approve")}
                            disabled={approveMutation.mutation.isPending}
                          />
                        )}

                        {/* Cancel action for draft/submitted */}
                        {["draft", "submitted"].includes(order.status) && (
                          <ActionButton
                            variant="danger"
                            size="sm"
                            label={t("purchaseOrders.actions.cancel")}
                            onClick={() => handleAction(order.id, "cancel")}
                            disabled={cancelMutation.mutation.isPending}
                          />
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

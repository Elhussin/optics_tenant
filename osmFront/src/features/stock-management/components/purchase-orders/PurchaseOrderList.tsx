"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  Plus,
  FileText,
  Package,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  Eye,
  MoreHorizontal,
} from "lucide-react";
import { useApiForm } from "@/src/shared/hooks/useApiForm";
import { ActionButton } from "@/src/shared/components/ui/buttons";
import { Badge } from "@/src/shared/components/ui/Badge";
import { safeToast } from "@/src/shared/utils/safeToast";
import {
  formsConfig,
  featuresConfig,
} from "@/src/shared/constants/entityConfig";

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
  { color: string; icon: React.ReactNode; bg: string }
> = {
  draft: {
    color: "text-gray-500",
    icon: <FileText size={14} />,
    bg: "bg-gray-100",
  },
  submitted: {
    color: "text-blue-500",
    icon: <Clock size={14} />,
    bg: "bg-blue-100",
  },
  approved: {
    color: "text-green-500",
    icon: <CheckCircle size={14} />,
    bg: "bg-green-100",
  },
  partially_received: {
    color: "text-amber-500",
    icon: <Package size={14} />,
    bg: "bg-amber-100",
  },
  received: {
    color: "text-emerald-500",
    icon: <Truck size={14} />,
    bg: "bg-emerald-100",
  },
  cancelled: {
    color: "text-red-500",
    icon: <XCircle size={14} />,
    bg: "bg-red-100",
  },
};

export default function PurchaseOrderList() {
  const t = useTranslations("inventory");
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState<string>("");

  // Fetch orders
  const ordersQuery = useApiForm({
    alias: formsConfig["purchase-orders"].listAlias,
    defaultValues: {},
    params: statusFilter ? { status: statusFilter } : {},
    enabled: true,
  });

  const orders: PurchaseOrder[] = useMemo(() => {
    const data = ordersQuery.query.data as any;
    return data?.results || data || [];
  }, [ordersQuery.query.data]);

  // Actions
  const submitMutation = useApiForm({
    alias: "products_purchase_orders_submit_create",
    defaultValues: {},
    enabled: false,
  });

  const approveMutation = useApiForm({
    alias: "products_purchase_orders_approve_create",
    defaultValues: {},
    enabled: false,
  });

  const cancelMutation = useApiForm({
    alias: "products_purchase_orders_cancel_create",
    defaultValues: {},
    enabled: false,
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
      safeToast.success(t(`purchaseOrders.actions.${action}Success`));
      ordersQuery.query.refetch();
    } catch (error: any) {
      safeToast.error(
        error?.message || t(`purchaseOrders.actions.${action}Error`),
      );
    }
  };

  const getStatusBadge = (status: string, display: string) => {
    const config = statusConfig[status] || statusConfig.draft;
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${config.color} ${config.bg}`}
      >
        {config.icon}
        {display}
      </span>
    );
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
        {ordersQuery.query.isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-secondary">{t("common.loading")}</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center">
            <Package className="w-16 h-16 mx-auto text-secondary/30 mb-4" />
            <p className="text-lg font-medium text-main mb-2">
              {t("purchaseOrders.empty.title")}
            </p>
            <p className="text-secondary mb-6">
              {t("purchaseOrders.empty.description")}
            </p>
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
                        {order.order_date}
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
                        <button
                          onClick={() =>
                            router.push(
                              `/dashboard/stock-management/purchase-orders/${order.id}`,
                            )
                          }
                          className="p-2 hover:bg-body rounded-lg transition-colors"
                          title={t("common.view")}
                        >
                          <Eye size={18} className="text-secondary" />
                        </button>

                        {order.status === "draft" && (
                          <ActionButton
                            variant="secondary"
                            size="sm"
                            label={t("purchaseOrders.actions.submit")}
                            onClick={() => handleAction(order.id, "submit")}
                          />
                        )}

                        {order.status === "submitted" && (
                          <ActionButton
                            variant="primary"
                            size="sm"
                            label={t("purchaseOrders.actions.approve")}
                            onClick={() => handleAction(order.id, "approve")}
                          />
                        )}

                        {["draft", "submitted"].includes(order.status) && (
                          <ActionButton
                            variant="danger"
                            size="sm"
                            label={t("purchaseOrders.actions.cancel")}
                            onClick={() => handleAction(order.id, "cancel")}
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

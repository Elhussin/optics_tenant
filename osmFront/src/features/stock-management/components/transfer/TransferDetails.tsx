"use client";

import React from "react";
import {
  ArrowLeftRight,
  Warehouse,
  Calendar,
  Package,
  Check,
  Clock,
  AlertCircle,
  ArrowLeft,
  Edit3,
  Loader2,
  User,
  FileText,
  Truck,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/src/shared/components/shadcn/ui/button";
import { GlassCard } from "@/src/shared/components/ui/GlassCard";
import { Badge } from "@/src/shared/components/ui/Badge";
import { ActionButton } from "@/src/shared/components/ui/buttons";
import api from "@/src/shared/api/axios";
import { safeToast } from "@/src/shared/utils/safeToast";
import { useApiForm } from "@/src/shared/hooks/useApiForm";
import { useTranslations } from "next-intl";
import type { StockTransfer, StockTransferItem } from "../../types";

// Editable statuses
const EDITABLE_STATUSES = ["pending", "approved"];

export function TransferDetails() {
  const t = useTranslations("inventory");
  const params = useParams();
  const router = useRouter();
  const transferId = params.id as string;

  // Fetch transfer details
  const {
    data: transfer,
    error,
    isLoading,
    refetch: mutate,
  } = useQuery<StockTransfer>({
    queryKey: ["transfer_detail", transferId],
    queryFn: async () => {
      const response = await api.customRequest(
        "products_stock_transfers_retrieve",
        {
          id: transferId,
        },
      );
      return response;
    },
    enabled: !!transferId,
    refetchOnWindowFocus: false,
  });

  // Mutations
  const submitMutation = useApiForm({
    alias: "products_stock_transfers_submit_create",
    showToast: false,
  });
  const approveMutation = useApiForm({
    alias: "products_stock_transfers_approve_create",
    showToast: false,
  });
  const shipMutation = useApiForm({
    alias: "products_stock_transfers_ship_create",
    showToast: false,
  });
  const receiveMutation = useApiForm({
    alias: "products_stock_transfers_receive_create",
    showToast: false,
  });

  const handleAction = async (
    action: "submit" | "approve" | "ship" | "receive",
  ) => {
    try {
      const mutations = {
        submit: submitMutation,
        approve: approveMutation,
        ship: shipMutation,
        receive: receiveMutation,
      };
      const messages = {
        submit:
          t("transfers.messages.submitSuccess") ||
          "Transfer submitted successfully",
        approve:
          t("transfers.messages.approveSuccess") ||
          "Transfer approved successfully",
        ship:
          t("transfers.messages.shipSuccess") ||
          "Transfer shipped successfully",
        receive:
          t("transfers.messages.receiveSuccess") ||
          "Transfer received successfully",
      };

      await mutations[action].mutation.mutateAsync({ id: transferId });
      safeToast(messages[action], { type: "success" });
      mutate();
    } catch (error: any) {
      const message =
        error?.response?.data?.detail ||
        t("transfers.messages.actionError") ||
        "Action failed";
      safeToast(message, { type: "error" });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<
      string,
      { variant: any; label: string; icon: React.ReactNode }
    > = {
      pending: {
        variant: "warning",
        label: t("transfers.status.pending"),
        icon: <Clock size={14} />,
      },
      submitted: {
        variant: "info",
        label: t("transfers.status.submitted"),
        icon: <FileText size={14} />,
      },
      shipped: {
        variant: "info",
        label: t("transfers.status.shipped"),
        icon: <Truck size={14} />,
      },
      received: {
        variant: "success",
        label: t("transfers.status.received"),
        icon: <CheckCircle2 size={14} />,
      },
      completed: {
        variant: "success",
        label: t("transfers.status.completed"),
        icon: <Check size={14} />,
      },
      cancelled: {
        variant: "danger",
        label: t("transfers.status.cancelled"),
        icon: <XCircle size={14} />,
      },
    };

    const config = statusMap[status] || {
      variant: "neutral",
      label: status,
      icon: null,
    };
    return (
      <Badge variant={config.variant} outline dot>
        {config.label}
      </Badge>
    );
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    return new Intl.DateTimeFormat("ar-SA", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(dateString));
  };

  const isEditable = transfer && EDITABLE_STATUSES.includes(transfer.status);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-body flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-primary animate-spin" />
          <p className="text-secondary">
            {t("common.loading") || "Loading..."}
          </p>
        </div>
      </div>
    );
  }

  if (error || !transfer) {
    return (
      <div className="min-h-screen bg-body flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center">
          <AlertCircle className="w-12 h-12 text-red-500" />
          <h2 className="text-xl font-semibold text-main">
            {t("transfers.details.loadError") || "Failed to load transfer"}
          </h2>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-primary text-white rounded-lg"
          >
            {t("common.back") || "Go Back"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-body py-8">
      <div className="container mx-auto px-4 max-w-5xl">
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
                <ArrowLeftRight className="w-8 h-8 text-primary" />
                {transfer.transfer_number}
              </h1>
              <div className="flex items-center gap-3 mt-2">
                {getStatusBadge(transfer.status)}
                <span className="text-secondary text-sm">
                  {formatDate(transfer.created_at)}
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-2 mt-4 md:mt-0">
            {/* Action Buttons based on status */}
            {transfer.status === "pending" && (
              <Button
                onClick={() => handleAction("submit")}
                disabled={submitMutation.mutation.isPending}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {submitMutation.mutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin ml-2" />
                ) : (
                  <Check className="w-4 h-4 ml-2" />
                )}
                {t("transfers.actions.submit")}
              </Button>
            )}
            {transfer.status === "submitted" && (
              <>
                <Button
                  onClick={() => handleAction("approve")}
                  disabled={approveMutation.mutation.isPending}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {approveMutation.mutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin ml-2" />
                  ) : (
                    <Check className="w-4 h-4 ml-2" />
                  )}
                  {t("transfers.actions.approve")}
                </Button>
                <Button
                  onClick={() => handleAction("ship")}
                  disabled={shipMutation.mutation.isPending}
                  className="bg-indigo-600 hover:bg-indigo-700"
                >
                  {shipMutation.mutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin ml-2" />
                  ) : (
                    <Truck className="w-4 h-4 ml-2" />
                  )}
                  {t("transfers.actions.ship")}
                </Button>
              </>
            )}
            {transfer.status === "shipped" && (
              <Button
                onClick={() => handleAction("receive")}
                disabled={receiveMutation.mutation.isPending}
                className="bg-green-600 hover:bg-green-700"
              >
                {receiveMutation.mutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin ml-2" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 ml-2" />
                )}
                {t("transfers.actions.accept")}
              </Button>
            )}
            {isEditable && (
              <Link
                href={`/dashboard/stock-management/transfers/${transfer.id}/edit`}
              >
                <Button variant="outline" className="gap-2">
                  <Edit3 className="w-4 h-4" />
                  {t("transfers.actions.edit")}
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Transfer Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* From Branch */}
          <GlassCard className="border-border-main/50">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                  <Warehouse className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <p className="text-sm text-secondary">
                    {t("transfers.details.fromBranch") || "From Branch"}
                  </p>
                  <h3 className="text-xl font-bold text-main">
                    {transfer.from_branch_name}
                  </h3>
                </div>
              </div>
              <p className="text-secondary text-sm">
                {t("transfers.details.branchCode") || "Code"}:{" "}
                {transfer.from_branch_code}
              </p>
            </div>
          </GlassCard>

          {/* To Branch */}
          <GlassCard className="border-border-main/50">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <Warehouse className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-secondary">
                    {t("transfers.details.toBranch") || "To Branch"}
                  </p>
                  <h3 className="text-xl font-bold text-main">
                    {transfer.to_branch_name}
                  </h3>
                </div>
              </div>
              <p className="text-secondary text-sm">
                {t("transfers.details.branchCode") || "Code"}:{" "}
                {transfer.to_branch_code}
              </p>
            </div>
          </GlassCard>
        </div>

        {/* Timeline */}
        <GlassCard className="border-border-main/50 mb-6">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-main mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              {t("transfers.details.timeline") || "Timeline"}
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 rounded-xl bg-surface border border-main/10">
                <Calendar className="w-5 h-5 mx-auto mb-2 text-blue-500" />
                <p className="text-xs text-secondary mb-1">
                  {t("transfers.details.requested") || "Requested"}
                </p>
                <p className="font-medium text-main text-sm">
                  {formatDate(transfer.requested_date)}
                </p>
              </div>
              <div className="text-center p-4 rounded-xl bg-surface border border-main/10">
                <Check className="w-5 h-5 mx-auto mb-2 text-green-500" />
                <p className="text-xs text-secondary mb-1">
                  {t("transfers.details.approved") || "Approved"}
                </p>
                <p className="font-medium text-main text-sm">
                  {formatDate(transfer.approved_date)}
                </p>
              </div>
              <div className="text-center p-4 rounded-xl bg-surface border border-main/10">
                <Truck className="w-5 h-5 mx-auto mb-2 text-indigo-500" />
                <p className="text-xs text-secondary mb-1">
                  {t("transfers.details.shipped") || "Shipped"}
                </p>
                <p className="font-medium text-main text-sm">
                  {formatDate(transfer.shipped_date)}
                </p>
              </div>
              <div className="text-center p-4 rounded-xl bg-surface border border-main/10">
                <CheckCircle2 className="w-5 h-5 mx-auto mb-2 text-emerald-500" />
                <p className="text-xs text-secondary mb-1">
                  {t("transfers.details.received") || "Received"}
                </p>
                <p className="font-medium text-main text-sm">
                  {formatDate(transfer.received_date)}
                </p>
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Users */}
        <GlassCard className="border-border-main/50 mb-6">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-main mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              {t("transfers.details.users") || "Users"}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-4 rounded-xl bg-surface border border-main/10">
                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <User className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-secondary">
                    {t("transfers.details.requestedBy") || "Requested By"}
                  </p>
                  <p className="font-medium text-main">
                    {transfer.requested_by || "-"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-xl bg-surface border border-main/10">
                <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <User className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-secondary">
                    {t("transfers.details.approvedBy") || "Approved By"}
                  </p>
                  <p className="font-medium text-main">
                    {transfer.approved_by || "-"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Notes */}
        {transfer.notes && (
          <GlassCard className="border-border-main/50 mb-6">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-main mb-3 flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                {t("transfers.details.notes") || "Notes"}
              </h3>
              <p className="text-secondary">{transfer.notes}</p>
            </div>
          </GlassCard>
        )}

        {/* Items */}
        <GlassCard className="border-border-main/50">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-main mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-primary" />
              {t("transfers.details.items") || "Items"} (
              {transfer.items?.length || 0})
            </h3>

            {transfer.items && transfer.items.length > 0 ? (
              <div className="space-y-3">
                {transfer.items.map(
                  (item: StockTransferItem, index: number) => (
                    <div
                      key={item.id || index}
                      className="p-4 rounded-xl bg-surface border border-main/10 hover:border-primary/30 transition-all"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-main">
                            {item.product_name}
                          </h4>
                          <p className="text-sm text-secondary">
                            {item.variant_name}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            SKU: {item.variant_sku}
                          </p>
                        </div>
                        <div className="text-left">
                          <div className="grid grid-cols-3 gap-4 text-center">
                            <div>
                              <p className="text-xs text-secondary mb-1">
                                {t("transfers.details.requested") ||
                                  "Requested"}
                              </p>
                              <p className="text-lg font-bold text-blue-600">
                                {item.quantity_requested}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-secondary mb-1">
                                {t("transfers.details.sent") || "Sent"}
                              </p>
                              <p className="text-lg font-bold text-indigo-600">
                                {item.quantity_sent}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-secondary mb-1">
                                {t("transfers.details.received") || "Received"}
                              </p>
                              <p className="text-lg font-bold text-green-600">
                                {item.quantity_received}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                      {item.unit_cost && (
                        <div className="mt-2 pt-2 border-t border-main/10 flex justify-between text-sm">
                          <span className="text-secondary">
                            {t("transfers.details.unitCost") || "Unit Cost"}
                          </span>
                          <span className="font-medium text-main">
                            {parseFloat(item.unit_cost).toFixed(2)}{" "}
                            {t("info.currency")}
                          </span>
                        </div>
                      )}
                    </div>
                  ),
                )}
              </div>
            ) : (
              <p className="text-secondary text-center py-8">
                {t("transfers.details.noItems") || "No items in this transfer"}
              </p>
            )}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}

export default TransferDetails;

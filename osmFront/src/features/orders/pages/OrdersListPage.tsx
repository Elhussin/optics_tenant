"use client";

import React, { useMemo, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import {
  Eye,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  ShoppingCart,
  XCircle,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

import { GlassCard } from "@/src/shared/components/ui/GlassCard";
import { ActionButton } from "@/src/shared/components/ui/buttons";
import { Badge } from "@/src/shared/components/ui/Badge";
import { Pagination } from "@/src/shared/components/views/Pagination";
import { SectionLoading } from "@/src/shared/components/ui/Spinner";
import { EmptyState } from "@/src/shared/components/ui/EmptyState";
import { ConfirmDialog } from "@/src/shared/components/ui/dialogs/ConfirmDialog";

import { cn } from "@/src/shared/utils/cn";
import { safeToast } from "@/src/shared/utils/safeToast";
import { useFilteredListRequest } from "@/src/shared/hooks/useFilteredListRequest";
import { useApiForm } from "@/src/shared/hooks/useApiForm";

function formatMoney(amount: any, locale: string) {
  const n = Number.parseFloat(String(amount ?? "0"));
  if (Number.isNaN(n)) return "-";
  return n.toLocaleString(locale, { maximumFractionDigits: 2 });
}

function getCustomerLabel(order: any) {
  const customer = order?.customer;
  if (customer && typeof customer === "object") {
    return (
      customer.full_name ||
      [customer.first_name, customer.last_name].filter(Boolean).join(" ") ||
      customer.name ||
      String(customer.id ?? "")
    );
  }

  return (
    order?.customer_name || (customer !== undefined ? String(customer) : "-")
  );
}

export default function OrdersListPage() {
  const t = useTranslations("orders");
  const locale = useLocale();

  const router = useRouter();
  const searchParams = useSearchParams();

  const {
    data,
    totalPages,
    page,
    setPage,
    setPageSize,
    page_size,
    isLoading,
    count,
    refetch,
  } = useFilteredListRequest({ alias: "sales_orders_list" });

  const cancelRequest = useApiForm({
    alias: "sales_orders_cancel_create",
    showToast: false,
  });

  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const [status, setStatus] = useState(searchParams.get("status") ?? "");
  const [paymentStatus, setPaymentStatus] = useState(
    searchParams.get("payment_status") ?? "",
  );
  const [customer, setCustomer] = useState(searchParams.get("customer") ?? "");

  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedCancelId, setSelectedCancelId] = useState<number | null>(null);

  const [bulkUpdateOpen, setBulkUpdateOpen] = useState(false);
  const bulkUpdateRequest = useApiForm({
    alias: "sales_orders_bulk_update_status", // We will need to map this alias
    // method: "post",
    // url: "/sales/orders/bulk-update-status/", // Direct URL for now or via alias mapping
    onSuccess: (response) => {
      safeToast(response.message || "تم تحديث الطلبات بنجاح", {
        type: "success",
      });
      setBulkUpdateOpen(false);
      refetch();
    },
    onError: (error) => {
      safeToast(error.message || "فشل تحديث الطلبات", { type: "error" });
    },
  });

  const handleBulkUpdate = (newStatus: string) => {
    if (!filteredData?.length) return;
    const ids = filteredData.map((o: any) => o.id);
    bulkUpdateRequest.submitForm({ ids, status: newStatus });
  };

  const filteredData = useMemo(() => {
    const from = dateFrom ? new Date(`${dateFrom}T00:00:00`) : null;
    const to = dateTo ? new Date(`${dateTo}T23:59:59`) : null;

    if (!from && !to) return data;

    return (data || []).filter((order: any) => {
      const createdAt = order?.created_at ? new Date(order.created_at) : null;
      if (!createdAt || Number.isNaN(createdAt.getTime())) return false;

      if (from && createdAt < from) return false;
      if (to && createdAt > to) return false;
      return true;
    });
  }, [data, dateFrom, dateTo]);

  const applyFilters = () => {
    const params = new URLSearchParams();

    if (page_size) params.set("page_size", String(page_size));
    params.set("page", "1");

    if (search) params.set("search", search);
    if (status) params.set("status", status);
    if (paymentStatus) params.set("payment_status", paymentStatus);
    if (customer) params.set("customer", customer);

    router.push(`?${params.toString()}`);
  };

  const resetFilters = () => {
    setSearch("");
    setStatus("");
    setPaymentStatus("");
    setCustomer("");
    setDateFrom("");
    setDateTo("");
    router.push("?");
  };

  const openCancelDialog = (id: number) => {
    setSelectedCancelId(id);
    setCancelDialogOpen(true);
  };

  const handleConfirmCancel = async () => {
    if (!selectedCancelId) return;

    try {
      await cancelRequest.mutation.mutateAsync({ id: selectedCancelId });
      safeToast(t("toasts.cancelSuccess"), { type: "success" });
      await refetch();
    } catch (e) {
      safeToast(t("toasts.cancelError"), { type: "error" });
    } finally {
      setCancelDialogOpen(false);
      setSelectedCancelId(null);
    }
  };

  const renderOrderStatus = (value: any) => {
    const s = String(value ?? "pending");
    const variant =
      s === "delivered"
        ? "success"
        : s === "cancelled"
        ? "danger"
        : s === "confirmed"
        ? "info"
        : s === "ready"
        ? "warning"
        : "neutral";

    return (
      <Badge variant={variant as any} outline dot>
        {t(`status.${s}`)}
      </Badge>
    );
  };

  const renderPaymentStatus = (value: any) => {
    const s = String(value ?? "pending");
    const variant =
      s === "paid"
        ? "success"
        : s === "partial"
        ? "warning"
        : s === "refunded"
        ? "neutral"
        : s === "disputed"
        ? "danger"
        : "danger";

    return (
      <Badge variant={variant as any} outline dot>
        {t(`paymentStatus.${s}`)}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <SectionLoading />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <GlassCard className="relative border-none" padding="sm">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 text-primary ring-1 ring-primary/20">
              <ShoppingCart className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-main">{t("title")}</h1>
              <p className="text-sm text-secondary">
                {t("description")} · {t("totalCount")}: {count ?? 0}
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <ActionButton
              variant="secondary"
              icon={
                <RefreshCw
                  className={cn(
                    "w-4 h-4",
                    (cancelRequest.mutation.isPending || isLoading) &&
                      "animate-spin",
                  )}
                />
              }
              onClick={() => refetch()}
              title={t("refresh")}
            />
            <ActionButton
              variant="primary"
              icon={<Plus className="w-4 h-4" />}
              label={t("create")}
              navigateTo="/dashboard/orders/create"
              className="shadow-lg shadow-primary/20"
            />
          </div>
        </div>
      </GlassCard>

      <GlassCard className="border-border-main/50" hover>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-end">
          <div className="lg:col-span-4">
            <label className="block text-sm text-secondary mb-2">
              {t("filters.searchPlaceholder")}
            </label>
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-surface border border-border-main rounded-xl py-2.5 pr-10 pl-4 text-sm focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                placeholder={t("filters.searchPlaceholder")}
              />
            </div>
          </div>

          <div className="lg:col-span-2">
            <label className="block text-sm text-secondary mb-2">
              {t("filters.status")}
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full bg-surface border border-border-main rounded-xl py-2.5 px-3 text-sm focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer font-medium"
            >
              <option value="">-</option>
              <option value="pending">{t("status.pending")}</option>
              <option value="confirmed">{t("status.confirmed")}</option>
              <option value="ready">{t("status.ready")}</option>
              <option value="delivered">{t("status.delivered")}</option>
              <option value="cancelled">{t("status.cancelled")}</option>
            </select>
          </div>

          <div className="lg:col-span-2">
            <label className="block text-sm text-secondary mb-2">
              {t("filters.paymentStatus")}
            </label>
            <select
              value={paymentStatus}
              onChange={(e) => setPaymentStatus(e.target.value)}
              className="w-full bg-surface border border-border-main rounded-xl py-2.5 px-3 text-sm focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer font-medium"
            >
              <option value="">-</option>
              <option value="pending">{t("paymentStatus.pending")}</option>
              <option value="partial">{t("paymentStatus.partial")}</option>
              <option value="paid">{t("paymentStatus.paid")}</option>
              <option value="refunded">{t("paymentStatus.refunded")}</option>
              <option value="disputed">{t("paymentStatus.disputed")}</option>
            </select>
          </div>

          <div className="lg:col-span-2">
            <label className="block text-sm text-secondary mb-2">
              {t("table.customer")}
            </label>
            <input
              value={customer}
              onChange={(e) => setCustomer(e.target.value)}
              className="w-full bg-surface border border-border-main rounded-xl py-2.5 px-3 text-sm focus:ring-2 focus:ring-primary/20 transition-all font-medium"
            />
          </div>

          <div className="lg:col-span-2">
            <label className="block text-sm text-secondary mb-2">
              {t("table.date")}
            </label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full bg-surface border border-border-main rounded-xl py-2.5 px-3 text-sm focus:ring-2 focus:ring-primary/20 transition-all font-medium"
              />
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full bg-surface border border-border-main rounded-xl py-2.5 px-3 text-sm focus:ring-2 focus:ring-primary/20 transition-all font-medium"
              />
            </div>
          </div>

          <div className="lg:col-span-12 flex flex-col sm:flex-row gap-3 justify-end">
            <ActionButton
              variant="outline"
              label={t("filters.reset")}
              onClick={resetFilters}
            />
            <ActionButton
              variant="primary"
              label={t("filters.apply")}
              onClick={applyFilters}
            />
            {filteredData?.length > 0 && (
              <ActionButton
                variant="secondary"
                label="تحديث الكل"
                icon={<RefreshCw className="w-4 h-4" />}
                onClick={() => setBulkUpdateOpen(true)}
                className="bg-orange-50 text-orange-600 border-orange-200 hover:bg-orange-100"
              />
            )}
          </div>
        </div>
      </GlassCard>

      <GlassCard className="border-border-main/50" hover>
        {filteredData?.length ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border-main/50 text-sm">
                  <th className="text-right py-3 px-4 font-semibold text-secondary">
                    {t("table.orderNumber")}
                  </th>
                  <th className="text-right py-3 px-4 font-semibold text-secondary">
                    {t("table.customer")}
                  </th>
                  <th className="text-right py-3 px-4 font-semibold text-secondary">
                    {t("table.status")}
                  </th>
                  <th className="text-right py-3 px-4 font-semibold text-secondary">
                    {t("table.total")}
                  </th>
                  <th className="text-right py-3 px-4 font-semibold text-secondary">
                    {t("table.date")}
                  </th>
                  <th className="text-right py-3 px-4 font-semibold text-secondary">
                    {t("table.paymentStatus")}
                  </th>
                  <th className="text-center py-3 px-4 font-semibold text-secondary w-44">
                    {t("table.actions")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((order: any) => {
                  const canCancel =
                    order?.status !== "cancelled" &&
                    order?.status !== "delivered";

                  return (
                    <tr
                      key={order.id}
                      className="border-b border-border-main/30 hover:bg-elevated/30 transition-colors"
                    >
                      <td className="py-3 px-4 font-mono text-primary">
                        {order.order_number || order.id}
                      </td>
                      <td className="py-3 px-4 text-main font-medium">
                        {getCustomerLabel(order)}
                      </td>
                      <td className="py-3 px-4">
                        {renderOrderStatus(order.status)}
                      </td>
                      <td className="py-3 px-4 text-main font-semibold">
                        {formatMoney(order.total_amount, locale)}{" "}
                        {t("currency")}
                      </td>
                      <td className="py-3 px-4 text-secondary">
                        {order.created_at
                          ? new Intl.DateTimeFormat(locale).format(
                              new Date(order.created_at),
                            )
                          : "-"}
                      </td>
                      <td className="py-3 px-4">
                        {renderPaymentStatus(order.payment_status)}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center gap-2">
                          <ActionButton
                            variant="icon-view"
                            size="sm"
                            icon={<Eye size={18} />}
                            title={t("actions.view")}
                            navigateTo={`/dashboard/orders/${order.id}`}
                            className="rounded-lg"
                          />
                          <ActionButton
                            variant="icon-edit"
                            size="sm"
                            icon={<Pencil size={18} />}
                            title={t("actions.edit")}
                            navigateTo={`/dashboard/orders/${order.id}/edit`}
                            className="rounded-lg"
                          />
                          <ActionButton
                            variant="icon-delete"
                            size="sm"
                            icon={<XCircle size={18} />}
                            title={t("actions.cancel")}
                            disabled={
                              !canCancel || cancelRequest.mutation.isPending
                            }
                            onClick={() => openCancelDialog(order.id)}
                            className="rounded-lg border-2"
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            type="orders"
            title={t("empty.title")}
            description={t("empty.description")}
            action={
              <ActionButton
                variant="primary"
                icon={<Plus className="w-4 h-4" />}
                label={t("create")}
                navigateTo="/dashboard/orders/create"
                className="mt-3"
              />
            }
          />
        )}

        {totalPages > 1 && (
          <Pagination
            page={page}
            totalPages={totalPages}
            pageSize={page_size}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
          />
        )}
      </GlassCard>

      <ConfirmDialog
        open={cancelDialogOpen}
        title={t("dialogs.cancelTitle")}
        message={t("dialogs.cancelMessage")}
        onCancel={() => setCancelDialogOpen(false)}
        onConfirm={handleConfirmCancel}
        confirmText={t("dialogs.confirm")}
        cancelText={t("dialogs.close")}
        isDanger
      />

      <BulkUpdateStatusDialog
        open={bulkUpdateOpen}
        onOpenChange={setBulkUpdateOpen}
        onConfirm={handleBulkUpdate}
        isLoading={bulkUpdateRequest.mutation.isPending}
        selectedCount={filteredData?.length ?? 0}
      />
    </div>
  );
}

function BulkUpdateStatusDialog({
  open,
  onOpenChange,
  onConfirm,
  isLoading,
  selectedCount,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (status: string) => void;
  isLoading: boolean;
  selectedCount: number;
}) {
  const [status, setStatus] = useState("");
  const t = useTranslations("orders");

  const handleSubmit = () => {
    if (status) onConfirm(status);
  };

  return (
    <ConfirmDialog
      open={open}
      onCancel={() => onOpenChange(false)}
      onConfirm={handleSubmit}
      title="تحديث حالة الطلبات المفلترة"
      message={
        <div className="space-y-4">
          <p>
            سيتم تحديث حالة <strong>{selectedCount}</strong> طلب. هل أنت متأكد؟
          </p>
          <div className="space-y-2">
            <label className="text-sm font-medium">اختر الحالة الجديدة:</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full bg-surface border border-border-main rounded-xl py-2.5 px-3 text-sm focus:ring-2 focus:ring-primary/20"
            >
              <option value="">اختر الحالة...</option>
              <option value="confirmed">{t("status.confirmed")}</option>
              <option value="ready">{t("status.ready")}</option>
              <option value="delivered">{t("status.delivered")}</option>
              <option value="cancelled">{t("status.cancelled")}</option>
            </select>
          </div>
        </div>
      }
      confirmText={isLoading ? "جاري التحديث..." : "تحديث الحالة"}
      cancelText="إلغاء"
      isDanger={status === "cancelled"}
    />
  );
}

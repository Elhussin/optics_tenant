"use client";

import React, { useMemo, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import {
  Eye,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  FileText,
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

export default function InvoicesListPage() {
  const t = useTranslations("invoices");
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
  } = useFilteredListRequest({ alias: "sales_invoices_list" });

  const deleteRequest = useApiForm({
    alias: "sales_invoices_destroy",
    showToast: false,
  });

  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const [status, setStatus] = useState(searchParams.get("status") ?? "");
  const [customer, setCustomer] = useState(searchParams.get("customer") ?? "");

  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedDeleteId, setSelectedDeleteId] = useState<number | null>(null);

  const filteredData = useMemo(() => {
    const from = dateFrom ? new Date(`${dateFrom}T00:00:00`) : null;
    const to = dateTo ? new Date(`${dateTo}T23:59:59`) : null;

    if (!from && !to) return data;

    return (data || []).filter((invoice: any) => {
      const date = invoice?.invoice_date || invoice?.created_at;
      const invoiceDate = date ? new Date(date) : null;
      if (!invoiceDate || Number.isNaN(invoiceDate.getTime())) return false;

      if (from && invoiceDate < from) return false;
      if (to && invoiceDate > to) return false;
      return true;
    });
  }, [data, dateFrom, dateTo]);

  const applyFilters = () => {
    const params = new URLSearchParams();

    if (page_size) params.set("page_size", String(page_size));
    params.set("page", "1");

    if (search) params.set("search", search);
    if (status) params.set("status", status);
    if (customer) params.set("customer", customer);

    router.push(`?${params.toString()}`);
  };

  const resetFilters = () => {
    setSearch("");
    setStatus("");
    setCustomer("");
    setDateFrom("");
    setDateTo("");
    router.push("?");
  };

  const openDeleteDialog = (id: number) => {
    setSelectedDeleteId(id);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedDeleteId) return;

    try {
      await deleteRequest.mutation.mutateAsync({ id: selectedDeleteId });
      safeToast(t("toasts.deleteSuccess"), { type: "success" });
      await refetch();
    } catch (e) {
      safeToast(t("toasts.deleteError"), { type: "error" });
    } finally {
      setDeleteDialogOpen(false);
      setSelectedDeleteId(null);
    }
  };

  const renderStatus = (value: any) => {
    const s = String(value ?? "draft");
    const variant =
      s === "paid"
        ? "success"
        : s === "cancelled"
        ? "danger"
        : s === "overdue"
        ? "danger"
        : s === "partially_paid"
        ? "warning"
        : s === "issued"
        ? "info"
        : "neutral"; // draft

    return (
      <Badge variant={variant as any} outline dot>
        {t(`status.${s}`)}
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
              <FileText className="w-6 h-6" />
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
                    (deleteRequest.mutation.isPending || isLoading) &&
                      "animate-spin",
                  )}
                />
              }
              onClick={() => refetch()}
              title={t("refresh")}
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
              <option value="draft">{t("status.draft")}</option>
              <option value="issued">{t("status.issued")}</option>
              <option value="paid">{t("status.paid")}</option>
              <option value="partially_paid">
                {t("status.partially_paid")}
              </option>
              <option value="overdue">{t("status.overdue")}</option>
              <option value="cancelled">{t("status.cancelled")}</option>
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
                    {t("table.invoiceNumber")}
                  </th>
                  <th className="text-right py-3 px-4 font-semibold text-secondary">
                    {t("table.type")}
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
                    {t("table.paid")}
                  </th>
                  <th className="text-right py-3 px-4 font-semibold text-secondary">
                    {t("table.due_date")}
                  </th>
                  <th className="text-center py-3 px-4 font-semibold text-secondary w-44">
                    {t("table.actions")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((invoice: any) => {
                  const canEdit = invoice?.status === "draft";
                  const canDelete = invoice?.status === "draft";
                  const isInsurance =
                    invoice?.invoice_type_details?.code === "INSURANCE";

                  return (
                    <tr
                      key={invoice.id}
                      className="border-b border-border-main/30 hover:bg-elevated/30 transition-colors"
                    >
                      <td className="py-3 px-4 font-mono text-primary">
                        {invoice.invoice_number || invoice.id}
                      </td>
                      <td className="py-3 px-4">
                        <Badge
                          variant={isInsurance ? "info" : "neutral"}
                          className="text-xs"
                        >
                          {invoice.invoice_type_details?.name || "-"}
                        </Badge>
                        {isInsurance && invoice.insurance_details && (
                          <div className="text-xs text-secondary mt-1">
                            {invoice.insurance_details.provider_name}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-main font-medium">
                        {invoice.customer_name || "-"}
                      </td>
                      <td className="py-3 px-4">
                        {renderStatus(invoice.status)}
                      </td>
                      <td className="py-3 px-4 text-main font-semibold">
                        {formatMoney(invoice.total_amount, locale)}{" "}
                        {t("currency")}
                      </td>
                      <td className="py-3 px-4 text-green-600">
                        {formatMoney(invoice.paid_amount, locale)}
                      </td>
                      <td className="py-3 px-4 text-secondary">
                        {invoice.due_date
                          ? new Intl.DateTimeFormat(locale).format(
                              new Date(invoice.due_date),
                            )
                          : "-"}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center gap-2">
                          <ActionButton
                            variant="icon-view"
                            size="sm"
                            icon={<Eye size={18} />}
                            title={t("actions.view")}
                            navigateTo={`/dashboard/invoices/${invoice.id}`}
                            className="rounded-lg"
                          />
                          {/* Edit hidden for now as Orders control logic */}
                          {/*
                          <ActionButton
                            variant="icon-edit"
                            size="sm"
                            icon={<Pencil size={18} />}
                            title={t("actions.edit")}
                            navigateTo={`/dashboard/invoices/${invoice.id}/edit`}
                            disabled={!canEdit}
                            className="rounded-lg"
                          />
                          */}
                          <ActionButton
                            variant="icon-delete"
                            size="sm"
                            icon={<XCircle size={18} />}
                            title={t("actions.delete")}
                            disabled={
                              !canDelete || deleteRequest.mutation.isPending
                            }
                            onClick={() => openDeleteDialog(invoice.id)}
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
            // removed action to force Order creation
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
        open={deleteDialogOpen}
        title={t("dialogs.deleteTitle")}
        message={t("dialogs.deleteMessage")}
        onCancel={() => setDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        confirmText={t("dialogs.confirm")}
        cancelText={t("dialogs.close")}
        isDanger
      />
    </div>
  );
}

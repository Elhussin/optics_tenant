"use client";

import React, { useMemo, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import {
  Eye,
  Plus,
  RefreshCw,
  Search,
  CreditCard,
  XCircle,
  Edit,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

import { GlassCard } from "@/src/shared/components/ui/GlassCard";
import { ActionButton } from "@/src/shared/components/ui/buttons";
import { Badge } from "@/src/shared/components/ui/Badge";
import { Pagination } from "@/src/shared/components/views/Pagination";
import { SectionLoading } from "@/src/shared/components/ui/Spinner";
import { EmptyState } from "@/src/shared/components/ui/EmptyState";

import { cn } from "@/src/shared/utils/cn";
import { useFilteredListRequest } from "@/src/shared/hooks/useFilteredListRequest";

function formatMoney(amount: any, currency: any, locale: string) {
  const n = Number.parseFloat(String(amount ?? "0"));
  if (Number.isNaN(n)) return "-";
  return (
    n.toLocaleString(locale, { maximumFractionDigits: 2 }) +
    " " +
    (currency || "")
  );
}

export default function PaymentsListPage() {
  const t = useTranslations("payments"); // Ensure translations exist
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
  } = useFilteredListRequest({ alias: "sales_payments_list" });

  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const [status, setStatus] = useState(searchParams.get("status") ?? "");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const filteredData = useMemo(() => {
    const from = dateFrom ? new Date(`${dateFrom}T00:00:00`) : null;
    const to = dateTo ? new Date(`${dateTo}T23:59:59`) : null;

    if (!from && !to) return data;

    return (data || []).filter((payment: any) => {
      const date = payment?.paid_at || payment?.created_at;
      const paymentDate = date ? new Date(date) : null;
      if (!paymentDate || Number.isNaN(paymentDate.getTime())) return false;

      if (from && paymentDate < from) return false;
      if (to && paymentDate > to) return false;
      return true;
    });
  }, [data, dateFrom, dateTo]);

  const applyFilters = () => {
    const params = new URLSearchParams();

    if (page_size) params.set("page_size", String(page_size));
    params.set("page", "1");

    if (search) params.set("search", search);
    if (status) params.set("status", status);

    router.push(`?${params.toString()}`);
  };

  const resetFilters = () => {
    setSearch("");
    setStatus("");
    setDateFrom("");
    setDateTo("");
    router.push("?");
  };

  const renderStatus = (value: any) => {
    const s = String(value ?? "pending");
    const variant =
      s === "completed" || s === "paid"
        ? "success"
        : s === "failed" || s === "cancelled"
        ? "danger"
        : s === "refunded"
        ? "neutral"
        : "warning"; // pending/processing

    return (
      <Badge variant={variant as any} outline dot>
        {s}
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
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-main">
                {t("title", { fallback: "Payments" })}
              </h1>
              <p className="text-sm text-secondary">
                {t("description", { fallback: "Manage payments" })} · Total:{" "}
                {count ?? 0}
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <ActionButton
              variant="secondary"
              icon={
                <RefreshCw
                  className={cn("w-4 h-4", isLoading && "animate-spin")}
                />
              }
              onClick={() => refetch()}
              title="Refresh"
            />
            {/* Create Payment usually happens via Order, but if standalone supported: */}
            <ActionButton
              variant="primary"
              icon={<Plus className="w-4 h-4" />}
              label="Create"
              navigateTo="/dashboard/payments/create"
              className="shadow-lg shadow-primary/20"
            />
          </div>
        </div>
      </GlassCard>

      <GlassCard className="border-border-main/50" hover>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-end">
          <div className="lg:col-span-4">
            <label className="block text-sm text-secondary mb-2">Search</label>
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-surface border border-border-main rounded-xl py-2.5 pr-10 pl-4 text-sm focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                placeholder="Search payments..."
              />
            </div>
          </div>

          <div className="lg:col-span-3">
            <label className="block text-sm text-secondary mb-2">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full bg-surface border border-border-main rounded-xl py-2.5 px-3 text-sm focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer font-medium"
            >
              <option value="">All</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>

          <div className="lg:col-span-3">
            <label className="block text-sm text-secondary mb-2">Date</label>
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

          <div className="lg:col-span-2 flex flex-col sm:flex-row gap-3 justify-end">
            <ActionButton
              variant="outline"
              label="Reset"
              onClick={resetFilters}
            />
            <ActionButton
              variant="primary"
              label="Apply"
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
                    Invoice #
                  </th>
                  <th className="text-right py-3 px-4 font-semibold text-secondary">
                    Method
                  </th>
                  <th className="text-right py-3 px-4 font-semibold text-secondary">
                    Status
                  </th>
                  <th className="text-right py-3 px-4 font-semibold text-secondary">
                    Amount
                  </th>
                  <th className="text-right py-3 px-4 font-semibold text-secondary">
                    Date
                  </th>
                  <th className="text-center py-3 px-4 font-semibold text-secondary w-24">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((payment: any) => (
                  <tr
                    key={payment.id}
                    className="border-b border-border-main/30 hover:bg-elevated/30 transition-colors"
                  >
                    <td className="py-3 px-4 font-mono text-primary">
                      {payment.invoice_number || "-"}
                    </td>
                    <td className="py-3 px-4 text-main font-medium">
                      {payment.payment_method_display ||
                        payment.payment_method ||
                        "-"}
                    </td>
                    <td className="py-3 px-4">
                      {renderStatus(payment.status)}
                    </td>
                    <td className="py-3 px-4 text-main font-semibold">
                      {formatMoney(payment.amount, payment.currency, locale)}
                    </td>
                    <td className="py-3 px-4 text-secondary">
                      {payment.paid_at || payment.created_at
                        ? new Intl.DateTimeFormat(locale).format(
                            new Date(payment.paid_at || payment.created_at),
                          )
                        : "-"}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center gap-2">
                        <ActionButton
                          variant="icon-view"
                          size="sm"
                          icon={<Eye size={18} />}
                          title="View"
                          // navigateTo={`/dashboard/invoices/${payment.invoice}`} // Link to invoice
                          onClick={() => {}} // Placeholder or modal
                          className="rounded-lg"
                        />
                        <ActionButton
                          variant="icon-edit"
                          size="sm"
                          icon={<Edit size={18} />}
                          label=""
                          navigateTo={`/dashboard/payments/${payment.id}/edit`}
                          className="rounded-lg"
                          title="Edit"
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            type="orders"
            title="No payments found"
            description="Try adjusting your filters."
            action={null}
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
    </div>
  );
}

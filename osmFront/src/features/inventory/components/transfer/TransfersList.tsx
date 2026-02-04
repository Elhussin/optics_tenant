"use client";

import React, { useState, useMemo } from "react";
import {
  ArrowLeftRight,
  Plus,
  Filter,
  Search,
  Eye,
  Check,
  X,
  Loader2,
  Warehouse,
  Calendar,
  Package,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/src/shared/components/shadcn/ui/button";
import { Input } from "@/src/shared/components/shadcn/ui/input";
import { GlassCard } from "@/src/shared/components/ui/GlassCard";
import { Badge } from "@/src/shared/components/ui/Badge";
import { ActionButton } from "@/src/shared/components/ui/buttons";
import { SectionLoading } from "@/src/shared/components/ui/Spinner";
import { EmptyState } from "@/src/shared/components/ui/EmptyState";
import { useApiForm } from "@/src/shared/hooks/useApiForm";
import { safeToast } from "@/src/shared/utils/safeToast";
import type { StockTransfer } from "../../types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/shared/components/shadcn/ui/select";
import { ConfirmDialog } from "@/src/shared/components/ui/dialogs/ConfirmDialog";
import { useTranslations } from "next-intl";

export function TransfersList() {
  const t = useTranslations("inventory");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [branchFilter, setBranchFilter] = useState<string>("all");
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    transferId: number | null;
    action: "receive" | null;
  }>({ open: false, transferId: null, action: null });

  // Fetch transfers
  const { query, isBusy } = useApiForm({
    alias: "products_stock-transfers_list",
    defaultValues: {
      page_size: 100,
      ordering: "-created_at",
    },
    enabled: true,
  });

  const receiveMutation = useApiForm({
    alias: "products_stock-transfers_receive_create",
    showToast: false,
  });

  const transfers = useMemo(() => {
    const data: any = query.data;
    if (!data) return [];
    if (Array.isArray(data)) return data;
    return Array.isArray(data.results) ? data.results : [];
  }, [query.data]);

  // Filter transfers
  const filteredTransfers = useMemo(() => {
    return transfers.filter((transfer: StockTransfer) => {
      const matchesSearch =
        transfer.transfer_number
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        transfer.from_branch_name
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        transfer.to_branch_name
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || transfer.status === statusFilter;

      const matchesBranch =
        branchFilter === "all" ||
        transfer.from_branch.toString() === branchFilter ||
        transfer.to_branch.toString() === branchFilter;

      return matchesSearch && matchesStatus && matchesBranch;
    });
  }, [transfers, searchQuery, statusFilter, branchFilter]);

  // Get unique branches
  const uniqueBranches = useMemo(() => {
    const branchMap = new Map<number, { id: number; name: string }>();
    transfers.forEach((t: StockTransfer) => {
      if (!branchMap.has(t.from_branch)) {
        branchMap.set(t.from_branch, {
          id: t.from_branch,
          name: t.from_branch_name,
        });
      }
      if (!branchMap.has(t.to_branch)) {
        branchMap.set(t.to_branch, {
          id: t.to_branch,
          name: t.to_branch_name,
        });
      }
    });
    return Array.from(branchMap.values());
  }, [transfers]);

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { variant: any; label: string }> = {
      pending: { variant: "warning", label: t("transfers.status.pending") },
      submitted: { variant: "info", label: t("transfers.status.submitted") },
      shipped: { variant: "info", label: t("transfers.status.shipped") },
      received: {
        variant: "success",
        label: t("transfers.status.received"),
      },
      completed: {
        variant: "success",
        label: t("transfers.status.completed"),
      },
      cancelled: {
        variant: "danger",
        label: t("transfers.status.cancelled"),
      },
    };

    const config = statusMap[status] || { variant: "neutral", label: status };
    return (
      <Badge variant={config.variant} outline dot>
        {config.label}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat("ar-SA", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(new Date(dateString));
  };

  const handleReceive = async (transferId: number) => {
    setConfirmDialog({ open: true, transferId, action: "receive" });
  };

  const executeReceive = async () => {
    if (!confirmDialog.transferId) return;

    try {
      await receiveMutation.mutation.mutateAsync({
        id: confirmDialog.transferId,
      });
      safeToast(t("transfers.messages.receiveSuccess"), { type: "success" });
      query.refetch();
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.detail ||
        error?.response?.data?.message ||
        t("transfers.messages.receiveError");
      safeToast(errorMessage, { type: "error" });
    } finally {
      setConfirmDialog({ open: false, transferId: null, action: null });
    }
  };

  // Stats
  const stats = useMemo(() => {
    return {
      total: transfers.length,
      pending: transfers.filter(
        (t: StockTransfer) =>
          t.status === "pending" || t.status === "submitted",
      ).length,
      shipped: transfers.filter((t: StockTransfer) => t.status === "shipped")
        .length,
      completed: transfers.filter(
        (t: StockTransfer) =>
          t.status === "received" || t.status === "completed",
      ).length,
    };
  }, [transfers]);

  return (
    <div className="min-h-screen bg-body py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-main flex items-center gap-3">
              <ArrowLeftRight className="w-8 h-8 text-primary" />
              {t("transfers.title")}
            </h1>
            <p className="text-secondary mt-1">{t("transfers.subtitle")}</p>
          </div>

          <Link href="/dashboard/inventory/transfers/create">
            <Button className="gap-2 bg-primary hover:bg-primary/90 mt-4 md:mt-0 shadow-lg shadow-primary/20">
              <Plus className="w-4 h-4" />
              {t("transfers.newTransfer")}
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <GlassCard className="border-border-main/50" hover>
            <div className="p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <ArrowLeftRight className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <p className="text-sm text-secondary">
                  {t("transfers.stats.total")}
                </p>
              </div>
              <p className="text-4xl font-bold text-blue-600 dark:text-blue-400">
                {stats.total}
              </p>
            </div>
          </GlassCard>

          <GlassCard className="border-border-main/50" hover>
            <div className="p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                  <Loader2 className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                </div>
                <p className="text-sm text-secondary">
                  {t("transfers.stats.pending")}
                </p>
              </div>
              <p className="text-4xl font-bold text-amber-600 dark:text-amber-400">
                {stats.pending}
              </p>
            </div>
          </GlassCard>

          <GlassCard className="border-border-main/50" hover>
            <div className="p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                  <Package className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <p className="text-sm text-secondary">
                  {t("transfers.stats.shipped")}
                </p>
              </div>
              <p className="text-4xl font-bold text-indigo-600 dark:text-indigo-400">
                {stats.shipped}
              </p>
            </div>
          </GlassCard>

          <GlassCard className="border-border-main/50" hover>
            <div className="p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <Check className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <p className="text-sm text-secondary">
                  {t("transfers.stats.completed")}
                </p>
              </div>
              <p className="text-4xl font-bold text-green-600 dark:text-green-400">
                {stats.completed}
              </p>
            </div>
          </GlassCard>
        </div>

        {/* Filters */}
        <GlassCard className="border-border-main/50 mb-6">
          <div className="p-6">
            <div className="flex flex-wrap gap-3">
              {/* Search */}
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder={t("transfers.filters.searchPlaceholder")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-9"
                />
              </div>

              {/* Status Filter */}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <Filter className="w-4 h-4 ml-2" />
                  <SelectValue placeholder={t("transfers.filters.status")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    {t("transfers.filters.allStatus")}
                  </SelectItem>
                  <SelectItem value="pending">
                    {t("transfers.status.pending")}
                  </SelectItem>
                  <SelectItem value="submitted">
                    {t("transfers.status.submitted")}
                  </SelectItem>
                  <SelectItem value="shipped">
                    {t("transfers.status.shipped")}
                  </SelectItem>
                  <SelectItem value="received">
                    {t("transfers.status.received")}
                  </SelectItem>
                  <SelectItem value="completed">
                    {t("transfers.status.completed")}
                  </SelectItem>
                  <SelectItem value="cancelled">
                    {t("transfers.status.cancelled")}
                  </SelectItem>
                </SelectContent>
              </Select>

              {/* Branch Filter */}
              <Select value={branchFilter} onValueChange={setBranchFilter}>
                <SelectTrigger className="w-48">
                  <Warehouse className="w-4 h-4 ml-2" />
                  <SelectValue placeholder={t("transfers.filters.branch")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    {t("transfers.filters.allBranches")}
                  </SelectItem>
                  {uniqueBranches.map((branch) => (
                    <SelectItem key={branch.id} value={branch.id.toString()}>
                      {branch.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </GlassCard>

        {/* Transfers List */}
        <GlassCard className="border-border-main/50">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-main mb-4">
              {t("transfers.list.title")} ({filteredTransfers.length})
            </h3>

            {isBusy ? (
              <div className="flex items-center justify-center min-h-[300px]">
                <SectionLoading />
              </div>
            ) : filteredTransfers.length === 0 ? (
              <EmptyState
                title={t("transfers.list.emptyTitle")}
                description={t("transfers.list.emptyDescription")}
              />
            ) : (
              <div className="space-y-3">
                {filteredTransfers.map(
                  (transfer: StockTransfer, index: number) => (
                    <div
                      key={transfer.id}
                      className="p-4 rounded-xl bg-surface border border-border-main hover:border-primary/50 transition-all duration-300 animate-fade-in-up"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="font-semibold text-main font-mono text-lg">
                            {transfer.transfer_number}
                          </p>
                          <div className="flex items-center gap-2 text-sm text-secondary mt-1">
                            <Calendar size={14} />
                            {formatDate(transfer.created_at)}
                          </div>
                        </div>
                        {getStatusBadge(transfer.status)}
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-3">
                        <div>
                          <p className="text-xs text-secondary mb-1">
                            {t("transfers.list.from")}
                          </p>
                          <div className="flex items-center gap-2">
                            <Warehouse size={16} className="text-primary" />
                            <p className="font-medium text-main">
                              {transfer.from_branch_name}
                            </p>
                          </div>
                        </div>
                        <div>
                          <p className="text-xs text-secondary mb-1">
                            {t("transfers.list.to")}
                          </p>
                          <div className="flex items-center gap-2">
                            <Warehouse size={16} className="text-primary" />
                            <p className="font-medium text-main">
                              {transfer.to_branch_name}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-border-main/50">
                        <div className="text-sm text-secondary">
                          {transfer.items_count}{" "}
                          {t("transfers.list.itemsCount")}
                        </div>
                        <div className="flex gap-2">
                          {/* زر قبول التحويل - يظهر فقط للتحويلات المشحونة */}
                          {transfer.status === "shipped" && (
                            <ActionButton
                              variant="success"
                              size="sm"
                              icon={<Check size={16} />}
                              label={t("transfers.actions.accept")}
                              onClick={() => handleReceive(transfer.id)}
                              disabled={receiveMutation.mutation.isPending}
                            />
                          )}
                          <Link
                            href={`/dashboard/inventory/transfers/${transfer.id}`}
                          >
                            <ActionButton
                              variant="icon-view"
                              size="sm"
                              icon={<Eye size={16} />}
                              title={t("transfers.actions.view")}
                            />
                          </Link>
                        </div>
                      </div>
                    </div>
                  ),
                )}
              </div>
            )}
          </div>
        </GlassCard>
      </div>

      {/* Confirm Dialog */}
      <ConfirmDialog
        open={confirmDialog.open}
        title={t("transfers.dialog.receiveTitle")}
        message={t("transfers.dialog.receiveMessage")}
        onCancel={() =>
          setConfirmDialog({ open: false, transferId: null, action: null })
        }
        onConfirm={executeReceive}
        confirmText={t("transfers.dialog.confirm")}
        cancelText={t("transfers.dialog.cancel")}
        isDanger={false}
      />
    </div>
  );
}

export default TransfersList;

"use client";

import { formatRelatedValue } from "@/src/shared/utils/formatRelatedValue";
import { useRef, useEffect, useState, useCallback } from "react";
import {
  handleDownloadPDF,
  handleCopy,
  handlePrint,
} from "@/src/shared/utils/cardViewHelper";
import { useMergedTranslations } from "@/src/shared/utils/useMergedTranslations";
import { ViewCardProps } from "@/src/shared/types";
import { RenderButtons } from "@/src/shared/components/ui/buttons/RenderButtons";
import { formsConfig } from "@/src/shared/constants/entityConfig";
import { ActionButton } from "@/src/shared/components/ui/buttons";
import {
  Copy,
  Printer,
  FileText,
  ArrowLeft,
  Calendar,
  User,
  Hash,
  Sparkles,
} from "lucide-react";
import { useApiForm } from "@/src/shared/hooks/useApiForm";
import { useRouter } from "@/src/app/i18n/navigation";

// Premium UI Components
import { GlassCard } from "@/src/shared/components/ui/GlassCard";
import { Badge } from "@/src/shared/components/ui/Badge";
import { Skeleton, SkeletonGroup } from "@/src/shared/components/ui/Skeleton";
import { EmptyState } from "@/src/shared/components/ui/EmptyState";
import { cn } from "@/src/shared/utils/cn";

export default function ViewDetailsCard(props: ViewCardProps) {
  const { entity, id } = props;
  const router = useRouter();
  const form = formsConfig[entity];
  const [data, setData] = useState<any | null>(null);
  const printRef = useRef<HTMLDivElement>(null);
  const t = useMergedTranslations(["viewDetailsCard", entity]);

  // hook لجلب البيانات
  const formRequest = useApiForm({
    alias: form.retrieveAlias,
    defaultValues: { id: Number(id) },
    onError: (err: any) => console.error(err),
  });

  // Fetch data on mount and when id changes
  useEffect(() => {
    const fetchData = async () => {
      if (id == null) return;
      const result = await formRequest.query.refetch();
      setData(result?.data);
    };

    fetchData();
  }, [id]); // ✅ فقط id في الـ dependencies

  // refetch function للاستخدام في RenderButtons
  const refetch = useCallback(async () => {
    if (id == null) return;
    const result = await formRequest.query.refetch();
    setData(result?.data);
  }, [id]); // ✅ بدون formRequest.query

  // 1. Error States
  if (!entity || !id) {
    return (
      <EmptyState
        type="error"
        title={t("entityError")}
        description={t("invalidIdOrEntity")}
      />
    );
  }

  if (!form) {
    return (
      <EmptyState
        type="error"
        title={t("noConfigError")}
        description={t("configNotFound")}
      />
    );
  }

  // 2. Loading State with Enhanced Skeleton
  if (formRequest.isBusy || !data) {
    return (
      <div className="max-w-5xl mx-auto space-y-6 p-4 animate-pulse">
        {/* Header Skeleton */}
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <Skeleton variant="title" width={300} />
            <Skeleton variant="text" width={200} />
          </div>
          <div className="flex gap-2">
            <Skeleton variant="button" />
            <Skeleton variant="button" />
          </div>
        </div>

        {/* Content Skeleton */}
        <div className="bg-elevated/50 rounded-3xl p-8">
          <SkeletonGroup type="list-item" count={12} />
        </div>
      </div>
    );
  }
  console.log(data);

  return (
    <div className="max-w-5xl mx-auto space-y-8 p-4 animate-fade-in">
      {/* Enhanced Header with Glassmorphism */}
      <div className="relative">
        {/* Gradient Background Glow */}
        <div className="absolute -inset-2 bg-gradient-to-r from-primary/20 via-secondary/20 to-primary/20 blur-2xl opacity-30 -z-10" />

        <GlassCard className="border-none overflow-visible" padding="sm">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            {/* Title Section */}
            <div className="space-y-2">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-3xl font-bold flex items-center gap-2">
                  <Sparkles className="w-7 h-7 text-primary" />
                  {t("detailsTitle")}
                </h1>
                {data?.is_deleted && (
                  <Badge variant="danger" dot>
                    {t("deletedItem")}
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-4 text-sm text-secondary flex-wrap">
                <div className="flex items-center gap-1.5">
                  <Hash size={16} className="text-primary" />
                  <span className="font-mono font-semibold">{data?.id}</span>
                </div>
                {data?.created_at && (
                  <div className="flex items-center gap-1.5">
                    <Calendar size={16} className="text-primary" />
                    <span>
                      {new Date(data.created_at).toLocaleDateString("ar-SA")}
                    </span>
                  </div>
                )}
                {data?.created_by && (
                  <div className="flex items-center gap-1.5">
                    <User size={16} className="text-primary" />
                    <span>{data.created_by}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Actions Section */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Back Button */}
              <ActionButton
                variant="secondary"
                size="md"
                icon={<ArrowLeft size={20} />}
                onClick={() => router.back()}
                title={t("back")}
                className="rounded-xl"
              />

              {/* Utility Actions Group */}
              <div className="flex gap-2 p-1.5 bg-elevated/50 rounded-xl border border-border-main">
                <ActionButton
                  variant="icon-info"
                  size="sm"
                  icon={<Copy size={18} />}
                  onClick={() => handleCopy(data, form.detailsField as any)}
                  title={t("copy")}
                  className="rounded-lg"
                />
                <ActionButton
                  variant="icon-info"
                  size="sm"
                  icon={<Printer size={18} />}
                  onClick={() =>
                    handlePrint(
                      printRef as React.RefObject<HTMLDivElement>,
                      t("detailsTitle"),
                    )
                  }
                  title={t("print")}
                  className="rounded-lg"
                />
                <ActionButton
                  variant="icon-info"
                  size="sm"
                  icon={<FileText size={18} />}
                  onClick={() =>
                    handleDownloadPDF(printRef, `${form.title}-${data.id}`)
                  }
                  title={t("pdf")}
                  className="rounded-lg"
                />
              </div>

              {/* CRUD Actions */}
              <RenderButtons
                data={data}
                alias={{
                  editAlias: form.partialUpdateAlias!,
                  deleteAlias: form.hardDeleteAlias!,
                }}
                isViewOnly={form.isViewOnly}
                navigatePath={`/dashboard/${entity}`}
                refetch={refetch}
              />
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Enhanced Details Card */}
      <div ref={printRef} className="relative group">
        {/* Background Glow on Hover */}
        <div className="absolute -inset-1 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10" />

        <GlassCard
          className="overflow-hidden shadow-xl hover:shadow-2xl transition-shadow duration-300"
          padding="none"
          animate="fade-in"
        >
          {/* Gradient Header Strip */}
          <div className="h-2 bg-gradient-to-r from-primary via-secondary to-primary animate-shimmer bg-[length:200%_100%]" />

          <div className="p-8 md:p-10">
            {/* Data Grid with Enhanced Styling */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {form.detailsField?.map((field: string, index: number) => {
                const value = data?.[field];
                const isPrimary = index < 3; // First 3 fields are primary

                return (
                  <div
                    key={field}
                    className={cn(
                      "group/item relative p-4 rounded-2xl transition-all duration-300",
                      "border border-border-main/50",
                      "hover:border-primary/50 hover:bg-primary/5 hover:shadow-md",
                      "hover:-translate-y-0.5",
                      isPrimary && "bg-primary/5 border-primary/20",
                    )}
                  >
                    {/* Field Label */}
                    <dt className="flex items-center gap-2 text-xs font-semibold text-secondary uppercase tracking-wider mb-2">
                      {isPrimary && (
                        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                      )}
                      {t(field)}
                    </dt>

                    {/* Field Value */}
                    <dd
                      className={cn(
                        "font-semibold text-main break-words",
                        isPrimary ? "text-xl" : "text-base",
                        field.includes("status") &&
                          "inline-block px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm",
                      )}
                    >
                      {formatRelatedValue(value, field, t)}
                    </dd>

                    {/* Hover Indicator */}
                    <div className="absolute bottom-0 left-4 right-4 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent opacity-0 group-hover/item:opacity-100 transition-opacity" />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Footer with Metadata */}
          {(data?.updated_at || data?.updated_by) && (
            <div className="px-8 py-4 bg-elevated/30 border-t border-border-main/50">
              <div className="flex items-center justify-between text-xs text-secondary">
                {data?.updated_at && (
                  <span>
                    آخر تحديث:{" "}
                    {new Date(data.updated_at).toLocaleString("ar-SA")}
                  </span>
                )}
                {data?.updated_by && <span>بواسطة: {data.updated_by}</span>}
              </div>
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  );
}

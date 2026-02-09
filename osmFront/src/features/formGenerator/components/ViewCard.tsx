"use client";

import { useEffect } from "react";
import { useFilteredListRequest } from "@/src/shared/hooks/useFilteredListRequest";
import { SearchFilterForm } from "../../../shared/components/search/SearchFilterForm";
import { formsConfig } from "@/src/shared/constants/formsConfig";
import { ActionButton } from "@/src/shared/components/ui/buttons";
import { ArrowLeft, Eye, Pencil, Plus, ListFilter } from "lucide-react";
import { useMergedTranslations } from "@/src/shared/utils/useMergedTranslations";
import { formatRelatedValue } from "@/src/shared/utils/formatRelatedValue";
import { useFilterDataOptions } from "@/src/shared/hooks/useFilterDataOptions";
import { Pagination } from "../../../shared/components/views/Pagination";
import { useSearchButton } from "@/src/shared/contexts/SearchButtonContext";

// New Premium UI Components
import {
  GlassCard,
  GlassCardHeader,
} from "@/src/shared/components/ui/GlassCard";
import { Badge } from "@/src/shared/components/ui/Badge";
import { SkeletonGroup } from "@/src/shared/components/ui/Skeleton";
import { EmptyState } from "@/src/shared/components/ui/EmptyState";
import { cn } from "@/src/shared/utils/cn";
import { PageHeader } from "@/src/shared/components/ui/PageHeader";

export default function ViewCard({ entity }: { entity: string }) {
  const { filterAlias, listAlias, fields, isViewOnly } = formsConfig[entity];
  const t = useMergedTranslations(["viewCard", entity]);

  const {
    data,
    count,
    page,
    setPage,
    setFilters,
    isLoading,
    page_size,
    setPageSize,
    totalPages,
  } = useFilteredListRequest({ alias: listAlias || "" });

  const { show } = useSearchButton();

  useEffect(() => {
    show();
  }, [show]);

  const { fields: filterFields, isLoading: isFieldsLoading } =
    useFilterDataOptions(filterAlias || "", {
      enabled: !!filterAlias,
    });

  // 1. Loading State with Skeletons
  if (isLoading || isFieldsLoading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-16 w-full bg-elevated/50 rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <SkeletonGroup type="card" count={8} />
        </div>
      </div>
    );
  }

  // 2. Empty State
  if (!data || data.length === 0) {
    return (
      <div className="space-y-6">
        <SearchFilterForm fields={filterFields} setFilters={setFilters} />
        <EmptyState
          type="search"
          title={t("noDataFound")}
          description={t("tryAdjustingFilters")}
          action={
            !isViewOnly && (
              <ActionButton
                variant="primary"
                icon={<Plus size={18} />}
                navigateTo={`/dashboard/${entity}/create`}
                title={`${t("createTitle")} ${entity}`}
              />
            )
          }
        />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* 3. Header Section with Glassmorphism */}
      <PageHeader
        title={t("title")}
        description={`${t("manageAndView")} ${entity}`}
        icon={<ListFilter />}
        badge={
          <Badge variant="neutral" className="font-mono">
            {count}
          </Badge>
        }
      >
        {!isViewOnly && (
          <ActionButton
            variant="success"
            size="md"
            icon={<Plus size={20} />}
            label={t("createNew")}
            navigateTo={`/dashboard/${entity}/create`}
            title={t("createTitle")}
            className="shadow-lg shadow-success/30 hover:shadow-xl hover:shadow-success/40 rounded-xl"
          />
        )}
        <ActionButton
          variant="secondary"
          size="md"
          icon={<ArrowLeft size={20} />}
          navigateTo={`/dashboard/`}
          title={t("backToDashboard")}
        />
      </PageHeader>

      {/* 4. Filter Form */}
      <SearchFilterForm fields={filterFields} setFilters={setFilters} />

      {/* 5. Enhanced Grid with GlassCards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {data.map((item: any, idx: number) => (
          <GlassCard
            key={item.id}
            hover
            className="group hover-lift shadow-soft hover:shadow-glow-primary border-border-main/50"
            animate="slide-up"
            padding="none"
          >
            {/* Card Content */}
            <div className="p-5 space-y-4">
              <div className="space-y-3">
                {fields?.slice(0, 5).map((field, index) => {
                  const value = item[field];
                  const isPrimary = index === 0;

                  return (
                    <div
                      key={field}
                      className={cn(
                        "flex justify-between items-start gap-2",
                        !isPrimary &&
                          "text-sm border-b border-border-main/30 pb-2 last:border-0 last:pb-0",
                      )}
                    >
                      <span className="text-secondary font-medium shrink-0">
                        {t(field)}
                      </span>
                      <span
                        className={cn(
                          "font-semibold text-main text-left truncate",
                          isPrimary ? "text-lg text-primary" : "text-sm",
                          field.includes("status") &&
                            "px-2 py-0.5 rounded-full bg-primary/5 text-primary text-xs",
                        )}
                      >
                        {formatRelatedValue(value, field, t)}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Action Buttons - Using semantic variants for consistency */}
              <div className="flex justify-end gap-3 pt-4 border-t border-border-main/50">
                <ActionButton
                  variant="icon-view"
                  size="sm"
                  navigateTo={`/dashboard/${entity}/${item.id}`}
                  icon={<Eye size={18} />}
                  title={t("view")}
                  className="rounded-xl"
                />
                {!isViewOnly && (
                  <ActionButton
                    variant="icon-edit"
                    size="sm"
                    navigateTo={`/dashboard/${entity}/${item.id}/edit`}
                    icon={<Pencil size={18} />}
                    title={t("edit")}
                    className="rounded-xl"
                  />
                )}
              </div>
            </div>
          </GlassCard>
        ))}
      </div>

      {/* 6. Footer/Pagination */}
      <div className="mt-10 py-6 border-t border-border-main/30 animate-fade-in">
        <Pagination
          page={page}
          totalPages={totalPages}
          pageSize={page_size}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
        />
      </div>
    </div>
  );
}

"use client";

import { ActionButton } from "@/src/shared/components/ui/buttons";
import { Pencil, Eye, FileText, Globe, Check, X } from "lucide-react";
import { useFilteredListRequest } from "@/src/shared/hooks/useFilteredListRequest";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import { featuresConfig } from "@/src/features/formGenerator/constants/entityConfig";
import { useFilterDataOptions } from "@/src/shared/hooks/useFilterDataOptions";
import { SearchFilterForm } from "@/src/shared/components/search/SearchFilterForm";
import { Pagination } from "@/src/shared/components/views/Pagination";
import { useSearchButton } from "@/src/shared/contexts/SearchButtonContext";
import PublicPages from "./PublicPages";
import { GlassCard } from "@/src/shared/components/ui/GlassCard";
import { Badge } from "@/src/shared/components/ui/Badge";
import { Skeleton, SkeletonGroup } from "@/src/shared/components/ui/Skeleton";
import { EmptyState } from "@/src/shared/components/ui/EmptyState";
import { cn } from "@/src/shared/utils/cn";

export const PagesList = () => {
  const t = useTranslations("pagesList");
  const locale = useLocale();
  const { show } = useSearchButton();
  show();

  const { filterAlias, listAlias } = featuresConfig["pages"];

  const {
    data,
    totalPages,
    page,
    setPage,
    setPageSize,
    page_size,
    setFilters,
    isLoading,
  } = useFilteredListRequest({ alias: listAlias || "" });

  const { fields, isLoading: isFieldsLoading } = useFilterDataOptions(
    filterAlias || "",
    {
      enabled: !!filterAlias,
    }
  );

  // Enhanced Loading State
  if (isLoading || !data || isFieldsLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <PublicPages />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <GlassCard key={i} padding="lg">
              <div className="space-y-3">
                <Skeleton variant="title" width="70%" height={24} />
                <Skeleton variant="text" width="50%" height={16} />
                <Skeleton variant="text" width="60%" height={16} />
                <div className="flex gap-2 mt-4">
                  <Skeleton variant="button" width={80} height={36} />
                  <Skeleton variant="button" width={80} height={36} />
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      </div>
    );
  }

  // Empty State
  if (data.length === 0) {
    return (
      <div className="space-y-6">
        <PublicPages />
        <EmptyState
          type="default"
          title={t("noPages")}
          description={t("noPagesDesc")}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SearchFilterForm fields={fields} setFilters={setFilters} />
      <PublicPages />

      {/* Pages Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 animate-fade-in">
        {data?.map((p: any, index: number) => {
          // اختيار الترجمة المناسبة
          const translation =
            p.translations?.find((t: any) => t.language === locale) ||
            p.translations?.find((t: any) => t.language === p.default_language);

          return (
            <div
              key={p.id ?? p.slug}
              className="group relative"
              style={{
                animationDelay: `${index * 50}ms`,
              }}
            >
              {/* Background Glow */}
              <div className="absolute -inset-1 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10" />

              <GlassCard
                className="h-full hover:shadow-2xl transition-all duration-300"
                padding="none"
              >
                {/* Gradient Top Strip */}
                <div className="h-1 bg-gradient-to-r from-primary via-secondary to-primary" />

                <div className="p-6 space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-main truncate flex items-center gap-2">
                        <FileText className="w-5 h-5 text-primary shrink-0" />
                        {translation?.title || p.slug}
                      </h3>
                      <p className="text-sm text-secondary mt-1 flex items-center gap-1.5">
                        <Globe size={14} />
                        {p.slug}
                      </p>
                    </div>

                    {/* Status Badge */}
                    <Badge
                      variant={p.is_published ? "success" : "warning"}
                      size="sm"
                    >
                      {p.is_published ? (
                        <>
                          <Check size={12} />
                          Published
                        </>
                      ) : (
                        <>
                          <X size={12} />
                          Draft
                        </>
                      )}
                    </Badge>
                  </div>

                  {/* SEO Info */}
                  {translation?.seo_title && (
                    <div className="p-3 rounded-lg bg-elevated/50 border border-border-main/30">
                      <p className="text-xs text-secondary font-medium">
                        SEO Title
                      </p>
                      <p className="text-sm text-main mt-1 line-clamp-2">
                        {translation.seo_title}
                      </p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-2 border-t border-border-main/30">
                    <ActionButton
                      label={t("edit")}
                      icon={<Pencil size={16} />}
                      variant="warning"
                      size="sm"
                      navigateTo={`/dashboard/pages/${p.id}/edit`}
                      className="flex-1 rounded-xl"
                    />
                    <ActionButton
                      label={t("view")}
                      icon={<Eye size={16} />}
                      variant="info"
                      size="sm"
                      navigateTo={`/dashboard/pages/${p.id}`}
                      className="flex-1 rounded-xl"
                    />
                  </div>
                </div>
              </GlassCard>
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      <Pagination
        page={page}
        totalPages={totalPages}
        pageSize={page_size}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
      />
    </div>
  );
};

"use client";

import MultilingualPageDisplay from "@/src/features/pages/components/MultilingualPageDisplay";
import { useEffect, useState } from "react";
import { Language } from "@/src/features/pages/types";
import { useApiForm } from "@/src/shared/hooks/useApiForm";
import { Skeleton, SkeletonGroup } from "@/src/shared/components/ui/Skeleton";
import { EmptyState } from "@/src/shared/components/ui/EmptyState";
import { GlassCard } from "@/src/shared/components/ui/GlassCard";
import { featuresConfig } from "@/src/features/formGenerator/constants/entityConfig";
export default function PublicPageViews({
  slug,
  locale,
}: {
  slug: string;
  locale: string;
}) {
  const pageRequest = useApiForm({
    alias: featuresConfig["public-pages"].retrieveAlias,
    defaultValues: { slug: slug },
  });

  const [pageData, setPageData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;

    const fetchPage = async () => {
      try {
        const res = await pageRequest.query.refetch();
        if (res?.status) {
          setPageData(res.data);
        } else {
          setError("Page not found");
        }
      } catch (err) {
        setError("Error loading page");
      } finally {
        setLoading(false);
      }
    };

    fetchPage();
  }, [slug]);

  // Enhanced Loading State
  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6 animate-fade-in">
        <GlassCard padding="lg">
          <div className="space-y-6">
            {/* Header Skeleton */}
            <div className="space-y-3">
              <Skeleton variant="title" width="70%" height={40} />
              <Skeleton variant="text" width="30%" height={20} />
            </div>

            {/* Divider */}
            <div className="border-t border-border-main/50" />

            {/* Content Skeleton */}
            <SkeletonGroup type="card" count={5} />
          </div>
        </GlassCard>
      </div>
    );
  }

  // Enhanced Error State
  if (error || !pageData) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <EmptyState
          type="error"
          title={error || "Page not found"}
          description="The page you're looking for doesn't exist or has been removed."
        />
      </div>
    );
  }

  return (
    <MultilingualPageDisplay
      page={pageData}
      defaultLanguage={locale as Language}
    />
  );
}

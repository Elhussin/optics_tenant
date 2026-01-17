"use client";

import { ActionButton } from "@/src/shared/components/ui/buttons";
import { Plus, FileText, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import { GlassCard } from "@/src/shared/components/ui/GlassCard";
import { cn } from "@/src/shared/utils/cn";

export default function PublicPages() {
  const publicPages = [
    "about",
    "contact",
    "privacy",
    "terms",
    "faq",
    "support",
    "careers",
    "blog",
  ];
  const t = useTranslations("pages");
  const t2 = useTranslations("publicPagesList");

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header with Create Button */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-primary/10">
            <Sparkles className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-main">{t("publicPages")}</h1>
            <p className="text-sm text-secondary">{t("publicPagesDesc")}</p>
          </div>
        </div>

        <ActionButton
          label={t("createNewPage")}
          icon={<Plus size={18} />}
          variant="success"
          size="lg"
          navigateTo="/dashboard/pages/create"
          className="rounded-xl shadow-lg hover:shadow-xl"
        />
      </div>

      {/* Public Pages Grid */}
      <GlassCard padding="lg">
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-border-main/50">
            <FileText className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-main">
              {t("publicPages")}
            </h2>
          </div>

          <div className="grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {publicPages.map((page, index) => (
              <div
                key={page}
                className="group relative"
                style={{
                  animationDelay: `${index * 50}ms`,
                }}
              >
                {/* Background Glow */}
                <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />

                <div
                  className={cn(
                    "p-4 rounded-xl border-2 transition-all duration-200",
                    "bg-elevated hover:bg-elevated/80",
                    "border-border-main hover:border-primary/50",
                    "hover:scale-105 active:scale-95",
                    "cursor-pointer"
                  )}
                >
                  <ActionButton
                    label={t2(page)}
                    icon={<Plus size={16} />}
                    variant="ghost"
                    size="sm"
                    navigateTo={`/dashboard/pages/create?default=${page}`}
                    className="w-full justify-start"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </GlassCard>

      {/* Divider */}
      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border-main to-transparent" />
        <span className="text-sm font-medium text-secondary">
          {t("allPages")}
        </span>
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border-main to-transparent" />
      </div>
    </div>
  );
}

import React from "react";
import { ArrowRight } from "lucide-react";
import { ActionButton } from "@/src/shared/components/ui/buttons";
import { GlassCard } from "@/src/shared/components/ui/GlassCard";
import { Badge } from "@/src/shared/components/ui/Badge";
import { cn } from "@/src/shared/utils/cn";

interface PageHeaderProps {
  title: string;
  description?: string;
  backUrl?: string;
  backTitle?: string;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}
import { useRouter } from "next/navigation";
export const PageHeader = ({
  title,
  description,
  backUrl,
  backTitle,
  icon,
  badge,
  children,
  className,
}: PageHeaderProps) => {
  const router = useRouter();
  return (
    <div className={cn("relative mb-8", className)}>
      {/* Gradient Background Glow - Only show if we have an icon/premium feel */}
      {icon && (
        <div className="absolute -inset-2 bg-gradient-to-r from-primary/20 via-secondary/20 to-primary/20 blur-2xl opacity-30 -z-10" />
      )}

      <GlassCard className="border-none overflow-visible" padding="sm">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-4 flex-1 w-full sm:w-auto">
            {/* Back Button */}
            {backUrl && (
              <ActionButton
                icon={
                  <ArrowRight size={20} className="rotate-180 rtl:rotate-0" />
                }
                variant="ghost"
                navigateTo={backUrl}
                onClick={() => router.back()}
                title={backTitle}
                className="shrink-0"
              />
            )}

            {/* Icon Box */}
            {icon && (
              <div
                className={cn(
                  "inline-flex items-center justify-center",
                  "w-12 h-12 rounded-xl",
                  "bg-gradient-to-br from-primary to-blue-600",
                  "text-white shadow-lg shadow-primary/30 shrink-0",
                )}
              >
                {/* Clone element to enforce size if needed, or just render */}
                {/* {React.isValidElement(icon)
                  ? React.cloneElement(icon as React.ReactElement, {
                      size: 20,
                    })
                  : icon} */}
              </div>
            )}

            {/* Title & Description */}
            <div className="text-center sm:text-start space-y-1">
              <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-bold text-main">
                  {title}
                </h1>
                {badge}
              </div>
              {description && (
                <p className="text-sm text-secondary">{description}</p>
              )}
            </div>
          </div>

          {/* Right Side Actions */}
          {children && (
            <div className="flex items-center gap-2 shrink-0">{children}</div>
          )}
        </div>
      </GlassCard>
    </div>
  );
};

import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/src/shared/components/shadcn/ui/popover";
import { InfoIcon } from "lucide-react";
import { cn } from "@/src/shared/utils/cn";
import { useTranslations } from "next-intl";
import React from "react";

/**
 * ✨ InfoPopover - محسّن مع animations و hover effects
 */
export const InfoPopover = React.memo(({ hint }: { hint: string }) => {
  const t = useTranslations("products");
  if (!hint) return null;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "inline-flex items-center justify-center",
            "w-5 h-5 rounded-full",
            "text-muted-foreground hover:text-primary",
            "transition-smooth hover-scale",
            "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          )}
          aria-label="More information"
        >
          <InfoIcon className="w-4 h-4" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        className={cn(
          "w-72 p-4",
          "bg-elevated border-2 border-primary/20",
          "rounded-lg shadow-lg",
          "animate-fade-in-down"
        )}
        align="start"
        sideOffset={8}
      >
        <div className="space-y-2">
          <h4 className="font-semibold text-sm text-foreground flex items-center gap-2">
            <InfoIcon className="w-4 h-4 text-primary" />
            {t("additional_info")}
          </h4>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {hint}
          </p>
        </div>
      </PopoverContent>
    </Popover>
  );
});

InfoPopover.displayName = "InfoPopover";

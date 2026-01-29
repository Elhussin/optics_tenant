"use client";
import { useAside } from "@/src/shared/contexts/AsideContext";
import { Menu, X } from "lucide-react";
import { cn } from "@/src/shared/utils/cn";
import { useTranslations } from "next-intl";

export const AsideButton = () => {
  const { isVisible, toggleAside } = useAside();
  const t = useTranslations("asideButton");

  return (
    <button
      onClick={toggleAside}
      aria-label="Toggle Sidebar"
      className={cn(
        "p-2.5 rounded-xl cursor-pointer", // Base layout
        "transition-all duration-200", // Animation base
        "border-2", // Border width
        isVisible
          ? "bg-destructive/10 text-destructive border-destructive/20"
          : "bg-primary/10 text-primary border-primary/20 hover:bg-primary/20", // Colors
        "shadow-sm hover:shadow-md", // Shadows
      )}
      title={t("toggleSidebar")}
    >
      {/* Animated Icon Container */}
      <div
        className={cn(
          "transition-transform duration-200",
          isVisible ? "rotate-90" : "rotate-0",
        )}
      >
        {isVisible ? <X size={22} /> : <Menu size={22} />}
      </div>
    </button>
  );
};
//  <X size={22} className="text-button-text" />

// components/ui/Button.tsx
import React from "react";
import { cn } from "@/lib/utils/utils"; // دالة لدمج الكلاسات إن كنت تستخدمها
import { ButtonProps } from "@/types";

export default function Button({
  label,
  onClick,
  variant = "primary",
  icon,
  className = "",
  type = "button",
}: ButtonProps) {

  const variantClasses = {
    primary: "primary",
    secondary: "secondary",
    danger: "danger",
  };

  return (
    <button
      onClick={onClick}
      type={type}
      className={cn(
        "flex items-center gap-2 px-4 py-2 rounded-xl transition-all text-sm font-semibold",
        variantClasses[variant],
        className
      )}
    >
      {icon}
      {label}
    </button>
  );
}

// components/ui/Button.tsx
import React from "react";
import { cn } from "@/lib/utils/cn"; // دالة لدمج الكلاسات إن كنت تستخدمها
import { ButtonProps } from "@/types";

export default function Button(props: ButtonProps) {
const{  label,onClick,variant = "primary",icon,className = "",type = "button",title,disabled}=props

const variantClasses = {
    primary: "btn-primary",
    secondary: "btn-secondary",
    danger: "btn-danger",
    success: "btn-success",
    info: "btn-info",
  };

  return (
    <button
      onClick={onClick}
      type={type}
      title={title}
      disabled={disabled}
      className={cn(
        "btn cursor-pointer",
        variantClasses[variant],
        className
      )}
    >
      {icon}
      {label}
    </button>
  );
}

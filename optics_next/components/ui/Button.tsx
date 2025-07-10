// components/ui/Button.tsx
import React from "react";
import { cn } from "@/lib/utils/utils"; // دالة لدمج الكلاسات إن كنت تستخدمها
import { ButtonProps } from "@/types";

export default function Button(props: ButtonProps) {
const{  label,onClick,variant = "primary",icon,className = "",type = "button",title,}=props

const variantClasses = {
    primary: "btn btn-primary",
    secondary: "btn btn-secondary",
    danger: "btn btn-danger",
  };

  return (
    <button
      onClick={onClick}
      type={type}
      title={title}
      className={cn(
        "btn",
        variantClasses[variant],
        className
      )}
    >
      {icon}
      {label}
    </button>
  );
}

"use client";
import React from "react";
import { Check } from "lucide-react";
import { cn } from "@/src/shared/utils/cn";

interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  className?: string;
}

export const Checkbox = ({ checked, onChange, className }: CheckboxProps) => {
  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        onChange(!checked);
      }}
      className={cn(
        "w-5 h-5 rounded border transition-all flex items-center justify-center cursor-pointer",
        checked
          ? "bg-primary border-primary text-white"
          : "bg-elevated border-primary/20 hover:border-primary/50",
        className,
      )}
    >
      {checked && <Check size={14} strokeWidth={3} />}
    </div>
  );
};

/**
 * ✨ Switch - محسّن مع Theme Colors و Enhanced Animations
 * @description Enhanced switch component مع gradient و smooth transitions
 */

"use client";

import * as React from "react";
import * as SwitchPrimitive from "@radix-ui/react-switch";
import { cn } from "@/src/shared/utils/cn";

function Switch({
  className,
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        // ✨ Base styles
        "peer inline-flex h-6 w-11 shrink-0 items-center",
        "rounded-full border-2 transition-all duration-300",
        "outline-none cursor-pointer",
        
        // ✨ Checked state - Gradient background
        "data-[state=checked]:bg-gradient-to-r",
        "data-[state=checked]:from-primary",
        "data-[state=checked]:to-blue-600",
        "data-[state=checked]:border-primary",
        "data-[state=checked]:shadow-lg",
        "data-[state=checked]:shadow-primary/40",
        
        // ✨ Unchecked state - Theme colors
        "data-[state=unchecked]:bg-border",
        "data-[state=unchecked]:border-primary/20",
        "data-[state=unchecked]:shadow-md",
        
        // ✨ Hover states
        "hover:shadow-xl",
        "data-[state=checked]:hover:scale-105",
        "data-[state=unchecked]:hover:bg-border/80",
        
        // ✨ Focus states
        "focus-visible:ring-4",
        "focus-visible:ring-primary/20",
        "focus-visible:border-primary",
        
        // ✨ Disabled state
        "disabled:cursor-not-allowed",
        "disabled:opacity-50",
        "disabled:hover:scale-100",
        
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          // ✨ Base styles
          "pointer-events-none block h-5 w-5",
          "rounded-full shadow-lg",
          "ring-0 transition-all duration-300",
          
          // ✨ Background colors
          "bg-white",
          "data-[state=checked]:bg-white",
          
          // ✨ Position animation
          "data-[state=checked]:translate-x-5",
          "data-[state=unchecked]:translate-x-0",
          
          // ✨ Scale effect
          "data-[state=checked]:scale-110"
        )}
      />
    </SwitchPrimitive.Root>
  );
}

export { Switch };

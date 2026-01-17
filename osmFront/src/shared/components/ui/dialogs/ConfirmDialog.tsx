/**
 * ✨ ConfirmDialog - محسّن مع Animations و UI/UX Enhancements
 * @description Confirmation dialog مع glassmorphism و enhanced design
 */

"use client";

import React from "react";
import { ConfirmDialogProps } from "@/src/shared/types";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, CheckCircle, X } from "lucide-react";
import { cn } from "@/src/shared/utils/cn";

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  title = "Are you sure?",
  message = "This action cannot be undone.",
  onConfirm,
  onCancel,
  confirmText = "Confirm",
  cancelText = "Cancel",
  isDanger = true,
}) => {
  return (
    <AnimatePresence>
      {open && (
        <>
          {/* ✨ Enhanced Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onCancel}
            className={cn(
              "fixed inset-0 z-50",
              "bg-black/60 backdrop-blur-sm",
              "flex items-center justify-center p-4"
            )}
          >
            {/* ✨ Enhanced Dialog */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{
                duration: 0.3,
                ease: [0.4, 0, 0.2, 1],
              }}
              onClick={(e) => e.stopPropagation()}
              className={cn(
                "relative w-full max-w-md",
                "bg-background/95 backdrop-blur-xl",
                "border-2 border-border",
                "rounded-3xl shadow-2xl",
                "p-8"
              )}
            >
              {/* ✨ Close Button */}
              <button
                onClick={onCancel}
                className={cn(
                  "absolute top-4 right-4",
                  "w-8 h-8 rounded-full",
                  "flex items-center justify-center",
                  "bg-elevated hover:bg-destructive/10",
                  "text-muted-foreground hover:text-destructive",
                  "transition-all duration-200",
                  "hover:scale-110"
                )}
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>

              {/* ✨ Icon */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
                className={cn(
                  "w-16 h-16 rounded-2xl mb-6",
                  "flex items-center justify-center",
                  isDanger
                    ? "bg-destructive/10 text-destructive"
                    : "bg-primary/10 text-primary"
                )}
              >
                {isDanger ? (
                  <AlertTriangle className="w-8 h-8" />
                ) : (
                  <CheckCircle className="w-8 h-8" />
                )}
              </motion.div>

              {/* ✨ Title */}
              <h2 className={cn("text-2xl font-black mb-3", "text-foreground")}>
                {title}
              </h2>

              {/* ✨ Message */}
              <p
                className={cn(
                  "text-base leading-relaxed mb-8",
                  "text-muted-foreground"
                )}
              >
                {message}
              </p>

              {/* ✨ Enhanced Actions */}
              <div className="flex gap-3">
                {/* Cancel Button */}
                <button
                  onClick={onCancel}
                  className={cn(
                    "flex-1 px-6 py-3 rounded-xl",
                    "border-2 border-border",
                    "bg-background hover:bg-elevated",
                    "text-foreground font-semibold",
                    "transition-all duration-200",
                    "hover:scale-105 active:scale-95"
                  )}
                >
                  {cancelText}
                </button>

                {/* Confirm Button */}
                <button
                  onClick={onConfirm}
                  className={cn(
                    "group relative flex-1 px-6 py-3 rounded-xl overflow-hidden",
                    "font-bold text-center",
                    "transition-all duration-200",
                    "hover:scale-105 active:scale-95",
                    isDanger
                      ? [
                          "bg-gradient-to-r from-destructive to-red-600",
                          "text-white shadow-lg hover:shadow-xl hover:shadow-destructive/40",
                        ]
                      : [
                          "bg-gradient-to-r from-primary to-blue-500",
                          "text-white shadow-lg hover:shadow-xl hover:shadow-primary/40",
                        ]
                  )}
                >
                  {/* Shine effect */}
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700" />

                  <span className="relative z-10">{confirmText}</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

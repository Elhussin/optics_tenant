/**
 * ✨ DynamicFormDialog - محسّن مع Animations و UI/UX Enhancements
 * @description Draggable form dialog مع glassmorphism و enhanced design
 */

"use client";

import React, { useRef } from "react";
import Draggable from "react-draggable";
import { DynamicFormDialogProps } from "@/src/shared/types";
import { useTranslations } from "next-intl";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { X, GripVertical, Maximize2 } from "lucide-react";
import { cn } from "@/src/shared/utils/cn";

const DynamicFormGenerator = dynamic(
  () => import("@/src/features/formGenerator/components/DynamicFormGenerator"),
  { ssr: false }
);

const DynamicFormDialog: React.FC<DynamicFormDialogProps> = ({
  onClose,
  entity,
  title,
  defaultValues,
}) => {
  const nodeRef = useRef(null);
  const t = useTranslations(entity);

  return (
    <AnimatePresence>
      {/* ✨ Enhanced Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className={cn(
          "fixed inset-0 z-50",
          "bg-black/60 backdrop-blur-sm",
          "flex items-center justify-center p-4"
        )}
      >
        <Draggable handle=".modal-header" nodeRef={nodeRef} bounds="parent">
          {/* ✨ Enhanced Dialog */}
          <motion.div
            ref={nodeRef}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{
              duration: 0.3,
              ease: [0.4, 0, 0.2, 1],
            }}
            className={cn(
              "w-full max-w-3xl h-[85vh]",
              "bg-surface backdrop-blur-xl",
              "border-2 border-border",
              "rounded-3xl shadow-2xl",
              "flex flex-col",
              "overflow-hidden"
            )}
          >
            {/* ✨ Enhanced Draggable Header */}
            <div
              className={cn(
                "modal-header",
                "flex items-center justify-between gap-4",
                "px-6 py-4",
                "bg-elevated/50 backdrop-blur-md",
                "border-b-2 border-border",
                "cursor-move select-none",
                "group"
              )}
            >
              {/* Drag Handle */}
              <div
                className={cn(
                  "flex items-center gap-3",
                  "text-muted-foreground group-hover:text-primary",
                  "transition-colors"
                )}
              >
                <GripVertical className="w-5 h-5" />
                <h2 className="text-xl font-black text-foreground">
                  {t("title") || title}
                </h2>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                {/* Maximize hint (visual only) */}
                <button
                  className={cn(
                    "w-8 h-8 rounded-lg",
                    "flex items-center justify-center",
                    "bg-background hover:bg-elevated",
                    "text-muted-foreground hover:text-foreground",
                    "transition-all duration-200",
                    "hover:scale-110"
                  )}
                  aria-label="Draggable"
                  title="Drag to move"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>

                {/* Close Button */}
                <button
                  onClick={(e) => onClose(e)}
                  className={cn(
                    "w-8 h-8 rounded-lg",
                    "flex items-center justify-center",
                    "bg-background hover:bg-destructive/10",
                    "text-muted-foreground hover:text-destructive",
                    "transition-all duration-200",
                    "hover:scale-110"
                  )}
                  aria-label="Close"
                >
                  <X className="w-4 h-4 hover:text-destructive cursor-pointer" />
                </button>
              </div>
            </div>

            {/* ✨ Enhanced Content */}
            <div
              className={cn(
                "flex-1 overflow-y-auto",
                "p-6",
                "scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent"
              )}
            >
              <DynamicFormGenerator
                entity={entity}
                setData={(data: any) => onClose(data)}
                defaultValues={defaultValues!}
              />
            </div>
          </motion.div>
        </Draggable>
      </motion.div>
    </AnimatePresence>
  );
};

export default DynamicFormDialog;

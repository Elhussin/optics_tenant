/**
 * ✨ StepIndicator - محسّن مع Premium UI Design
 * @description Enhanced step indicator مع progress bar، animations، و GlassCard
 */

"use client";

import React from "react";
import { Check, Circle } from "lucide-react";
import { cn } from "@/src/shared/utils/cn";
import { motion } from "framer-motion";
import { GlassCard } from "@/src/shared/components/ui/GlassCard";
import { useTranslations } from "next-intl";

// interface Step {
//   id: number;
//   title: string;
//   description: string;
// }

// interface StepIndicatorProps {
//   steps: Step[];
//   currentStep: number;
// }

// export function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
//   // Calculate progress percentage
//   const progress = ((currentStep - 1) / (steps.length - 1)) * 100;

//   return (
//     <div className="w-full">
//       {/* ✨ Progress Bar */}
//       <div className="mb-8">
//         <div className="flex items-center justify-between mb-2">
//           <span className="text-sm font-bold text-foreground">التقدم</span>
//           <span className="text-sm font-black text-primary">
//             {Math.round(progress)}%
//           </span>
//         </div>
//         <div className={cn("h-2 rounded-full overflow-hidden", "bg-border/50")}>
//           <motion.div
//             initial={{ width: 0 }}
//             animate={{ width: `${progress}%` }}
//             transition={{ duration: 0.5, ease: "easeOut" }}
//             className={cn(
//               "h-full rounded-full",
//               "bg-gradient-to-r from-primary to-blue-600"
//             )}
//           />
//         </div>
//       </div>

//       {/* ✨ Desktop view */}
//       <div className="hidden md:flex items-center justify-center gap-0">
//         {steps.map((step, index) => {
//           const isCompleted = currentStep > step.id;
//           const isCurrent = currentStep === step.id;

//           return (
//             <React.Fragment key={step.id}>
//               {/* ✨ Step Circle */}
//               <div className="flex flex-col items-center">
//                 <motion.div
//                   initial={{ scale: 0 }}
//                   animate={{ scale: 1 }}
//                   transition={{
//                     delay: index * 0.1,
//                     type: "spring",
//                     stiffness: 500,
//                   }}
//                   className={cn(
//                     "relative w-14 h-14 rounded-full",
//                     "flex items-center justify-center",
//                     "font-black text-lg",
//                     "transition-all duration-300",
//                     "shadow-lg",
//                     isCompleted
//                       ? "bg-gradient-to-br from-success to-green-600 text-white scale-105"
//                       : isCurrent
//                       ? "bg-gradient-to-br from-primary to-blue-600 text-white ring-4 ring-primary/20 scale-110"
//                       : "bg-elevated text-muted-foreground border-2 border-primary/50"
//                   )}
//                 >
//                   {isCompleted ? (
//                     <motion.div
//                       initial={{ scale: 0, rotate: -180 }}
//                       animate={{ scale: 1, rotate: 0 }}
//                       transition={{ type: "spring", stiffness: 500 }}
//                     >
//                       <Check className="w-7 h-7" />
//                     </motion.div>
//                   ) : (
//                     <span>{step.id}</span>
//                   )}

//                   {/* ✨ Pulse effect for current step */}
//                   {isCurrent && (
//                     <motion.div
//                       className="absolute inset-0 rounded-full bg-primary/30"
//                       animate={{
//                         scale: [1, 1.3, 1],
//                         opacity: [0.5, 0, 0.5],
//                       }}
//                       transition={{
//                         duration: 2,
//                         repeat: Infinity,
//                         ease: "easeInOut",
//                       }}
//                     />
//                   )}
//                 </motion.div>

//                 {/* ✨ Step Info */}
//                 <motion.div
//                   initial={{ opacity: 0, y: 10 }}
//                   animate={{ opacity: 1, y: 0 }}
//                   transition={{ delay: index * 0.1 + 0.2 }}
//                   className="mt-3 text-center"
//                 >
//                   <p
//                     className={cn(
//                       "font-bold text-sm transition-colors",
//                       isCurrent
//                         ? "text-primary"
//                         : isCompleted
//                         ? "text-success"
//                         : "text-muted-foreground"
//                     )}
//                   >
//                     {step.title}
//                   </p>
//                   <p
//                     className={cn(
//                       "text-xs mt-0.5 max-w-[120px]",
//                       "text-muted-foreground/70"
//                     )}
//                   >
//                     {step.description}
//                   </p>
//                 </motion.div>
//               </div>

//               {/* ✨ Connector Line */}
//               {index < steps.length - 1 && (
//                 <div className="relative w-24 h-1 mx-2">
//                   {/* Background line */}
//                   <div
//                     className={cn("absolute inset-0 rounded-full", "bg-border")}
//                   />

//                   {/* ✨ Animated progress line */}
//                   <motion.div
//                     initial={{ width: 0 }}
//                     animate={{
//                       width: currentStep > step.id ? "100%" : "0%",
//                     }}
//                     transition={{ duration: 0.5, ease: "easeOut" }}
//                     className={cn(
//                       "absolute inset-y-0 left-0 rounded-full",
//                       "bg-gradient-to-r from-success to-green-600"
//                     )}
//                   />
//                 </div>
//               )}
//             </React.Fragment>
//           );
//         })}
//       </div>

//       {/* ✨ Mobile view */}
//       <div className="md:hidden">
//         {/* Step indicators */}
//         <div className="flex items-center justify-between mb-6 px-4">
//           {steps.map((step, index) => {
//             const isCompleted = currentStep > step.id;
//             const isCurrent = currentStep === step.id;

//             return (
//               <React.Fragment key={step.id}>
//                 <motion.div
//                   initial={{ scale: 0 }}
//                   animate={{ scale: 1 }}
//                   transition={{ delay: index * 0.1 }}
//                   className={cn(
//                     "relative w-10 h-10 rounded-full",
//                     "flex items-center justify-center",
//                     "text-sm font-bold",
//                     "transition-all shadow-lg",
//                     isCompleted
//                       ? "bg-gradient-to-br from-success to-green-600 text-white"
//                       : isCurrent
//                       ? "bg-gradient-to-br from-primary to-blue-600 text-white ring-4 ring-primary/20"
//                       : "bg-elevated text-muted-foreground border-2 border-primary/50"
//                   )}
//                 >
//                   {isCompleted ? (
//                     <Check className="w-5 h-5" />
//                   ) : (
//                     <span>{step.id}</span>
//                   )}

//                   {/* ✨ Pulse for current */}
//                   {isCurrent && (
//                     <motion.div
//                       className="absolute inset-0 rounded-full bg-primary/30"
//                       animate={{
//                         scale: [1, 1.3, 1],
//                         opacity: [0.5, 0, 0.5],
//                       }}
//                       transition={{
//                         duration: 2,
//                         repeat: Infinity,
//                       }}
//                     />
//                   )}
//                 </motion.div>

//                 {/* Connector for mobile */}
//                 {index < steps.length - 1 && (
//                   <div className="flex-1 h-1 mx-2 bg-border rounded-full overflow-hidden">
//                     <motion.div
//                       initial={{ width: 0 }}
//                       animate={{
//                         width: currentStep > step.id ? "100%" : "0%",
//                       }}
//                       transition={{ duration: 0.5 }}
//                       className="h-full bg-gradient-to-r from-success to-green-600"
//                     />
//                   </div>
//                 )}
//               </React.Fragment>
//             );
//           })}
//         </div>

//         {/* ✨ Current step info with GlassCard */}
//         <div className="relative">
//           {/* Subtle glow */}
//           <div className="absolute -inset-1 bg-gradient-to-r from-primary/10 to-blue-500/10 rounded-xl blur-lg opacity-50 -z-10" />

//           <motion.div
//             key={currentStep}
//             initial={{ opacity: 0, y: 10 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.3 }}
//           >
//             <GlassCard padding="sm" className="border-primary/20 text-center">
//               <p className="font-black text-foreground text-base mb-1">
//                 {steps[currentStep - 1].title}
//               </p>
//               <p className="text-sm text-secondary">
//                 {steps[currentStep - 1].description}
//               </p>
//             </GlassCard>
//           </motion.div>
//         </div>
//       </div>
//     </div>
//   );
// }

interface Step {
  id: number;
  title: string;
  description: string;
}

interface StepIndicatorProps {
  steps: Step[];
  currentStep: number;
}

export function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  const t = useTranslations("products");
  // Calculate progress percentage
  const progress = ((currentStep - 1) / (steps.length - 1)) * 100;

  return (
    <div className="w-full">
      {/* ✨ Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-bold text-foreground">
            {t("sections.progress")}
          </span>
          <span className="text-sm font-black text-primary">
            {Math.round(progress)}%
          </span>
        </div>
        <div className={cn("h-2 rounded-full overflow-hidden", "bg-border/50")}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className={cn(
              "h-full rounded-full",
              "bg-gradient-to-r from-primary to-blue-600",
            )}
          />
        </div>
      </div>

      {/* ✨ Desktop view */}
      <div className="hidden md:flex items-center justify-center gap-0">
        {steps.map((step, index) => {
          const isCompleted = currentStep > step.id;
          const isCurrent = currentStep === step.id;

          return (
            <React.Fragment key={step.id}>
              {/* ✨ Step Circle */}
              <div className="flex flex-col items-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{
                    delay: index * 0.1,
                    type: "spring",
                    stiffness: 500,
                  }}
                  className={cn(
                    "relative w-14 h-14 rounded-full",
                    "flex items-center justify-center",
                    "font-black text-lg",
                    "transition-all duration-300",
                    "shadow-lg",
                    isCompleted
                      ? "bg-gradient-to-br from-success to-green-600 text-white scale-105"
                      : isCurrent
                      ? "bg-gradient-to-br from-primary to-blue-600 text-white ring-4 ring-primary/20 scale-110"
                      : "bg-elevated text-muted-foreground border-2 border-primary/50",
                  )}
                >
                  {isCompleted ? (
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: "spring", stiffness: 500 }}
                    >
                      <Check className="w-7 h-7" />
                    </motion.div>
                  ) : (
                    <span>{step.id}</span>
                  )}

                  {/* ✨ Pulse effect for current step */}
                  {isCurrent && (
                    <motion.div
                      className="absolute inset-0 rounded-full bg-primary/30"
                      animate={{
                        scale: [1, 1.3, 1],
                        opacity: [0.5, 0, 0.5],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    />
                  )}
                </motion.div>

                {/* ✨ Step Info */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 + 0.2 }}
                  className="mt-3 text-center"
                >
                  <p
                    className={cn(
                      "font-bold text-sm transition-colors",
                      isCurrent
                        ? "text-primary"
                        : isCompleted
                        ? "text-success"
                        : "text-muted-foreground",
                    )}
                  >
                    {step.title}
                  </p>
                  <p
                    className={cn(
                      "text-xs mt-0.5 max-w-[120px]",
                      "text-muted-foreground/70",
                    )}
                  >
                    {step.description}
                  </p>
                </motion.div>
              </div>

              {/* ✨ Connector Line */}
              {index < steps.length - 1 && (
                <div className="relative w-24 h-1 mx-2">
                  {/* Background line */}
                  <div
                    className={cn("absolute inset-0 rounded-full", "bg-border")}
                  />

                  {/* ✨ Animated progress line */}
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{
                      width: currentStep > step.id ? "100%" : "0%",
                    }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className={cn(
                      "absolute inset-y-0 left-0 rounded-full",
                      "bg-gradient-to-r from-success to-green-600",
                    )}
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* ✨ Mobile view */}
      <div className="md:hidden">
        {/* Step indicators */}
        <div className="flex items-center justify-between mb-6 px-4">
          {steps.map((step, index) => {
            const isCompleted = currentStep > step.id;
            const isCurrent = currentStep === step.id;

            return (
              <React.Fragment key={step.id}>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className={cn(
                    "relative w-10 h-10 rounded-full",
                    "flex items-center justify-center",
                    "text-sm font-bold",
                    "transition-all shadow-lg",
                    isCompleted
                      ? "bg-gradient-to-br from-success to-green-600 text-white"
                      : isCurrent
                      ? "bg-gradient-to-br from-primary to-blue-600 text-white ring-4 ring-primary/20"
                      : "bg-elevated text-muted-foreground border-2 border-primary/50",
                  )}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <span>{step.id}</span>
                  )}

                  {/* ✨ Pulse for current */}
                  {isCurrent && (
                    <motion.div
                      className="absolute inset-0 rounded-full bg-primary/30"
                      animate={{
                        scale: [1, 1.3, 1],
                        opacity: [0.5, 0, 0.5],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                      }}
                    />
                  )}
                </motion.div>

                {/* Connector for mobile */}
                {index < steps.length - 1 && (
                  <div className="flex-1 h-1 mx-2 bg-border rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{
                        width: currentStep > step.id ? "100%" : "0%",
                      }}
                      transition={{ duration: 0.5 }}
                      className="h-full bg-gradient-to-r from-success to-green-600"
                    />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Current step info */}
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className={cn(
            "text-center p-4 rounded-xl",
            "bg-primary/5 border-2 border-primary/20",
          )}
        >
          <p className="font-black text-foreground text-base mb-1">
            {steps[currentStep - 1].title}
          </p>
          <p className="text-sm text-muted-foreground">
            {steps[currentStep - 1].description}
          </p>
        </motion.div>
      </div>
    </div>
  );
}

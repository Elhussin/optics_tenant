"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "@/src/app/i18n/navigation";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  Home,
  RefreshCw,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import { useEffect } from "react";
import { GlassCard } from "@/src/shared/components/ui/GlassCard";
import { ActionButton } from "@/src/shared/components/ui/buttons";
import { Badge } from "@/src/shared/components/ui/Badge";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("error");
  const router = useRouter();

  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-48 w-96 h-96 bg-danger/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-warning/5 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-lg w-full relative"
      >
        {/* Background Glow */}
        <div className="absolute -inset-2 bg-gradient-to-r from-danger/20 to-warning/20 rounded-3xl blur-2xl opacity-50" />

        <GlassCard
          className="relative overflow-hidden shadow-2xl text-center"
          padding="none"
        >
          {/* Gradient Top Strip */}
          <div className="h-1.5 bg-gradient-to-r from-danger via-warning to-danger animate-shimmer bg-[length:200%_100%]" />

          <div className="p-8">
            {/* Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="relative mx-auto flex items-center justify-center h-24 w-24 rounded-full mb-6"
            >
              <div className="absolute inset-0 bg-danger/10 rounded-full animate-ping" />
              <div className="relative bg-danger/10 h-24 w-24 rounded-full flex items-center justify-center">
                <AlertTriangle className="h-12 w-12 text-danger" />
              </div>
            </motion.div>

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-3xl font-bold text-main mb-2 flex items-center justify-center gap-2"
            >
              <Sparkles className="w-7 h-7 text-danger" />
              {t("title")}
            </motion.h1>

            {/* Description */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mb-8 space-y-4"
            >
              <p className="text-secondary text-lg">{t("message")}</p>

              {/* Error Message Badge */}
              <div className="p-4 rounded-xl bg-danger/5 border-2 border-danger/20 animate-fade-in">
                <div className="flex items-start gap-3">
                  <AlertCircle
                    size={20}
                    className="text-danger shrink-0 mt-0.5"
                  />
                  <div className="flex-1 text-left">
                    <p className="text-xs text-secondary font-medium uppercase mb-1">
                      {t("errorDetails")}
                    </p>
                    <p className="text-sm text-danger font-mono break-words">
                      {error.message || "Unknown error occurred"}
                    </p>
                    {error.digest && (
                      <p className="text-xs text-secondary mt-2">
                        {t("errorId")} {error.digest}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col sm:flex-row justify-center gap-4"
            >
              <ActionButton
                onClick={() => reset()}
                variant="danger"
                size="lg"
                icon={<RefreshCw size={18} />}
                label={t("tryAgain") || "Try Again"}
                className="rounded-xl shadow-lg hover:shadow-xl"
              />

              <ActionButton
                onClick={() => router.push("/")}
                variant="ghost"
                size="lg"
                icon={<Home size={18} />}
                label={t("homeButton")}
                className="rounded-xl"
              />
            </motion.div>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
}

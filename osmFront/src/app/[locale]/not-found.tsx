"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "@/src/app/i18n/navigation";
import { motion } from "framer-motion";
import { FileQuestion, Home, ArrowLeft, Sparkles } from "lucide-react";
import { GlassCard } from "@/src/shared/components/ui/GlassCard";
import { ActionButton } from "@/src/shared/components/ui/buttons";

export default function NotFoundPage() {
  const t = useTranslations("NotFound");
  const router = useRouter();

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-48 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-lg w-full relative"
      >
        {/* Background Glow */}
        <div className="absolute -inset-2 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-3xl blur-2xl opacity-50" />

        <GlassCard
          className="relative overflow-hidden shadow-2xl text-center"
          padding="none"
        >
          {/* Gradient Top Strip */}
          <div className="h-1.5 bg-gradient-to-r from-primary via-secondary to-primary animate-shimmer bg-[length:200%_100%]" />

          <div className="p-8">
            {/* Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="relative mx-auto flex items-center justify-center h-24 w-24 rounded-full mb-6"
            >
              <div className="absolute inset-0 bg-primary/10 rounded-full animate-ping" />
              <div className="relative bg-primary/10 h-24 w-24 rounded-full flex items-center justify-center">
                <FileQuestion className="h-12 w-12 text-primary" />
              </div>
            </motion.div>

            {/* 404 Title */}
            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-6xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2"
            >
              404
            </motion.h1>

            {/* Subtitle */}
            <motion.h2
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35 }}
              className="text-2xl font-semibold text-main mb-4 flex items-center justify-center gap-2"
            >
              <Sparkles className="w-6 h-6 text-primary" />
              {t("title")}
            </motion.h2>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-secondary mb-8 text-lg"
            >
              {t("description")}
            </motion.p>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col sm:flex-row justify-center gap-4"
            >
              <ActionButton
                onClick={() => router.back()}
                variant="ghost"
                size="lg"
                icon={<ArrowLeft size={18} />}
                label="Go Back"
                className="rounded-xl"
              />

              <ActionButton
                onClick={() => router.push("/")}
                variant="primary"
                size="lg"
                icon={<Home size={18} />}
                label={t("goHome")}
                className="rounded-xl shadow-lg hover:shadow-xl"
              />
            </motion.div>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
}

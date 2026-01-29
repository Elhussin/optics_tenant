/**
 * ✨ CTASection - محسّن مع Animations و UI/UX Enhancements
 * @description Call-to-action section مع particles و gradient effects
 */

"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Zap } from "lucide-react";
import { cn } from "@/src/shared/utils/cn";

export default function CTASection() {
  const t = useTranslations("ctaSection");

  return (
    <section
      className={cn(
        "relative py-32 overflow-hidden",
        "bg-gradient-to-br from-primary via-primary/90 to-primary/70"
      )}
    >
      {/* ✨ Enhanced Decorative background shapes */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-0 w-96 h-96 bg-white/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 animate-pulse-slow" />
        <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-white/10 rounded-full blur-2xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 animate-pulse-slow" />
        <div className="absolute bottom-1/3 right-1/4 w-48 h-48 bg-white/10 rounded-full blur-2xl" />
      </div>

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:32px_32px]" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto text-center"
        >
          {/* ✨ Sparkle icon */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            whileInView={{ scale: 1, rotate: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, type: "spring" }}
            className="inline-flex items-center justify-center w-16 h-16 mb-6 rounded-2xl bg-white/20 backdrop-blur-md"
          >
            <Sparkles className="w-8 h-8 text-white" />
          </motion.div>

          {/* ✨ Enhanced Title */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className={cn(
              "text-4xl sm:text-5xl lg:text-6xl font-bold mb-6",
              "text-white",
              "leading-tight"
            )}
          >
            {t("title") || "Ready to Streamline Your Optical Store?"}
          </motion.h2>

          {/* ✨ Enhanced Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className={cn(
              "text-lg sm:text-xl lg:text-2xl mb-12",
              "text-white/90",
              "max-w-3xl mx-auto"
            )}
          >
            {t("description") ||
              "Join hundreds of optical shops managing their inventory and patients with ease."}
          </motion.p>

          {/* ✨ Enhanced CTA Button */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5, type: "spring" }}
          >
            <Link
              href="/auth/register"
              className={cn(
                "group relative inline-flex items-center gap-3",
                "px-8 py-4 rounded-full overflow-hidden",
                "bg-white text-primary",
                "font-bold text-base sm:text-lg",
                "shadow-2xl hover:shadow-3xl",
                "transition-all duration-300",
                "hover:scale-105 active:scale-95"
              )}
            >
              {/* Shine effect */}
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700" />

              {/* Icon */}
              <Zap className="w-5 h-5 text-primary group-hover:rotate-12 transition-transform" />

              {/* Text */}
              <span className="relative z-10">
                {t("button") || "Get Started Now"}
              </span>

              {/* Arrow */}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>

          {/* ✨ Trust indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6 }}
            className="mt-12 flex items-center justify-center gap-8 flex-wrap text-white/80 text-sm"
          >
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span>{t("noCreditCard")}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span>{t("ctaDescription")}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span>{t("cancelAnytime")}</span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

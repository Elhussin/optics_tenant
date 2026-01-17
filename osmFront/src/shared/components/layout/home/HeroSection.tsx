/**
 * ✨ HeroSection - محسّن مع Animations و UI/UX Enhancements
 * @description Hero section مع gradient effects و enhanced design
 */

"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { useLocale } from "next-intl";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle, Sparkles, Zap } from "lucide-react";
import Image from "next/image";
import { cn } from "@/src/shared/utils/cn";

export default function HeroSection() {
  const t = useTranslations("heroSection");
  const locale = useLocale();
  const isRTL = locale === "ar";

  return (
    <section
      className={cn(
        "relative pt-24 pb-32 lg:pt-32 lg:pb-40 overflow-hidden",
        "bg-background"
      )}
    >
      {/* ✨ Enhanced Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] animate-blob" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-400/10 rounded-full blur-[120px] animate-blob animation-delay-2000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-purple-400/5 rounded-full blur-[100px] animate-blob animation-delay-4000" />
      </div>

      {/* Grid pattern */}
      <div className="absolute inset-0 bg-grid-primary/[0.02] bg-[size:32px_32px]" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          {/* ✨ Enhanced Text Content */}
          <div className="flex-1 text-center lg:text-start">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              {/* ✨ Enhanced Badge */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className={cn(
                  "inline-flex items-center gap-2 px-4 py-2 mb-8",
                  "rounded-full border-2 border-primary/20",
                  "bg-gradient-to-r from-primary/10 to-blue-500/10",
                  "backdrop-blur-md shadow-lg"
                )}
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
                </span>
                <Sparkles className="w-4 h-4 text-primary animate-pulse-slow" />
                <span className="text-sm font-bold text-primary">
                  {t("newVersion") || "New Version 2.0 Released"}
                </span>
              </motion.div>

              {/* ✨ Enhanced Heading with Gradient */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className={cn(
                  "text-5xl sm:text-6xl lg:text-7xl font-black",
                  "leading-tight mb-6",
                  "bg-gradient-to-r from-foreground via-foreground to-primary/70",
                  "bg-clip-text text-transparent"
                )}
              >
                {t("title")}
                <span className="text-primary">.</span>
              </motion.h1>

              {/* ✨ Enhanced Description */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className={cn(
                  "text-lg sm:text-xl lg:text-2xl mb-10",
                  "text-muted-foreground leading-relaxed",
                  "max-w-2xl mx-auto lg:mx-0"
                )}
              >
                {t("description")}
              </motion.p>

              {/* ✨ Enhanced CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 mb-12"
              >
                {/* Primary CTA */}
                <Link
                  href={`/${locale}/auth/register`}
                  className={cn(
                    "group relative inline-flex items-center gap-3",
                    "w-full sm:w-auto px-8 py-4 rounded-xl overflow-hidden",
                    "bg-gradient-to-r from-primary to-primary/80",
                    "text-white font-bold text-base",
                    "shadow-xl hover:shadow-2xl",
                    "transition-all duration-300",
                    "hover:scale-105 active:scale-95"
                  )}
                >
                  {/* Shine effect */}
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700" />

                  <Zap className="w-5 h-5 relative z-10 group-hover:rotate-12 transition-transform" />
                  <span className="relative z-10">{t("cta")}</span>
                  <ArrowRight
                    className={cn(
                      "w-5 h-5 relative z-10 transition-transform",
                      isRTL
                        ? "rotate-180 group-hover:-translate-x-1"
                        : "group-hover:translate-x-1"
                    )}
                  />
                </Link>

                {/* Secondary CTA */}
                <Link
                  href="#features"
                  className={cn(
                    "w-full sm:w-auto px-8 py-4 rounded-xl",
                    "border-2 border-border",
                    "bg-background hover:bg-elevated",
                    "text-foreground font-semibold text-base",
                    "transition-all hover:scale-105",
                    "hover:border-primary/50"
                  )}
                >
                  {t("learnMore") || "Learn More"}
                </Link>
              </motion.div>

              {/* ✨ Enhanced Trust Indicators */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.6 }}
                className="flex flex-wrap items-center justify-center lg:justify-start gap-x-6 gap-y-3"
              >
                {[
                  t("noCreditCard") || "No credit card required",
                  t("freeTrial") || "30-day free trial",
                  t("cancelAnytime") || "Cancel anytime",
                ].map((text, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-green-500/10 flex items-center justify-center">
                      <CheckCircle size={14} className="text-green-500" />
                    </div>
                    <span className="text-sm text-muted-foreground font-medium">
                      {text}
                    </span>
                  </div>
                ))}
              </motion.div>
            </motion.div>
          </div>

          {/* ✨ Enhanced Hero Image/Visual */}
          <div className="flex-1 w-full max-w-xl lg:max-w-none">
            <motion.div
              initial={{ opacity: 0, x: isRTL ? -40 : 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="relative"
            >
              {/* ✨ Enhanced Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-tr from-primary via-blue-400 to-purple-400 rounded-3xl blur-3xl opacity-20 scale-105 animate-pulse-slow" />

              {/* ✨ Enhanced Image Container */}
              <div
                className={cn(
                  "relative group",
                  "bg-elevated rounded-3xl",
                  "shadow-2xl border-2 border-border",
                  "overflow-hidden",
                  "transition-all duration-500",
                  "hover:shadow-3xl hover:scale-[1.02]"
                )}
              >
                {/* Image */}
                <div className="relative aspect-[4/3] flex items-center justify-center">
                  <Image
                    src="/media/FeaturesSection.png"
                    alt={t("dashboardPreview") || "Dashboard Preview"}
                    width={700}
                    height={525}
                    className={cn(
                      "object-cover w-full h-full",
                      "transition-transform duration-700",
                      "group-hover:scale-105"
                    )}
                    priority
                  />

                  {/* Overlay on hover */}
                  <div
                    className={cn(
                      "absolute inset-0",
                      "bg-gradient-to-t from-primary/20 via-transparent to-transparent",
                      "opacity-0 group-hover:opacity-100",
                      "transition-opacity duration-500"
                    )}
                  />
                </div>

                {/* ✨ Floating badge */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1, duration: 0.6 }}
                  className={cn(
                    "absolute bottom-6 left-6 right-6",
                    "p-4 rounded-2xl",
                    "bg-background/90 backdrop-blur-md",
                    "border-2 border-border",
                    "shadow-xl"
                  )}
                >
                  <p className="text-sm font-semibold text-foreground">
                    ✨ {t("dashboardPreview") || "Dashboard Preview"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Powerful analytics & insights
                  </p>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * ✨ FeaturesSection - محسّن مع Animations و UI/UX Enhancements
 * @description Features section مع enhanced cards و gradient effects
 */

"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import {
  BarChart3,
  Users,
  Store,
  ShieldCheck,
  Zap,
  Globe,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/src/shared/utils/cn";
import { useRouter } from "next/navigation";

export default function FeaturesSection() {
  const t = useTranslations("featuresSection");

  const router = useRouter();

  // ✨ Enhanced icons mapping
  const icons = [BarChart3, Users, Store, ShieldCheck, Zap, Globe];

  // Get features list
  let featuresList: string[] = [];
  try {
    const rawList = t.raw("list");
    if (Array.isArray(rawList)) {
      featuresList = rawList;
    } else if (typeof rawList === "object") {
      featuresList = Object.values(rawList);
    }
  } catch (e) {
    featuresList = [
      "Feature 1",
      "Feature 2",
      "Feature 3",
      "Feature 4",
      "Feature 5",
      "Feature 6",
    ];
  }

  // Map features to display format
  const displayFeatures = featuresList.slice(0, 6).map((text, i) => ({
    title: text,
    description: t("description"),
    icon: icons[i % icons.length],
  }));

  return (
    <section
      id="features"
      className={cn("relative py-24 lg:py-32 overflow-hidden", "bg-background")}
    >
      {/* ✨ Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
      </div>

      {/* Grid pattern */}
      <div className="absolute inset-0 bg-grid-primary/[0.02] bg-[size:32px_32px]" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* ✨ Enhanced Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 lg:mb-20">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className={cn(
              "inline-flex items-center gap-2 px-4 py-2 mb-6",
              "rounded-full border-2 border-primary/20",
              "bg-primary/10 backdrop-blur-sm"
            )}
          >
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-bold uppercase tracking-wider text-primary">
              {t("title") || "Features"}
            </span>
          </motion.div>

          {/* Title */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className={cn(
              "text-4xl sm:text-5xl lg:text-6xl font-black mb-6",
              "text-foreground leading-tight"
            )}
          >
            {t("subtitle")}
          </motion.h2>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-lg lg:text-xl text-muted-foreground leading-relaxed"
          >
            {t("subdescription")}
          </motion.p>
        </div>

        {/* ✨ Enhanced Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {displayFeatures.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{
                delay: index * 0.1,
                duration: 0.5,
                ease: [0.4, 0, 0.2, 1],
              }}
              className="group relative"
            >
              {/* Card */}
              <div
                className={cn(
                  "relative p-8 rounded-2xl h-full",
                  "bg-elevated border-2 border-primary/20",
                  "hover:border-primary/50",
                  "transition-all duration-300",
                  "hover:shadow-xl hover:-translate-y-2"
                )}
              >
                {/* Glow effect on hover */}
                <div
                  className={cn(
                    "absolute inset-0 rounded-2xl opacity-0",
                    "bg-gradient-to-br from-primary/5 to-blue-500/5",
                    "group-hover:opacity-100 transition-opacity duration-300"
                  )}
                />

                {/* Content */}
                <div className="relative z-10">
                  {/* ✨ Enhanced Icon */}
                  <div
                    className={cn(
                      "w-16 h-16 rounded-xl mb-6",
                      "bg-primary/10 group-hover:bg-primary/20",
                      "flex items-center justify-center",
                      "transition-all duration-300",
                      "group-hover:scale-110 group-hover:rotate-3"
                    )}
                  >
                    <feature.icon
                      className={cn(
                        "w-8 h-8 transition-colors duration-300",
                        "text-primary group-hover:text-primary-foreground"
                      )}
                    />
                  </div>

                  {/* Title */}
                  <h3
                    className={cn(
                      "text-xl font-bold mb-3",
                      "text-foreground",
                      "group-hover:text-primary transition-colors"
                    )}
                  >
                    {feature.title}
                  </h3>

                  {/* Description */}
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    {feature.description}
                  </p>

                  {/* ✨ Learn More Link */}
                  <div
                    className={cn(
                      "flex items-center gap-2 text-sm font-semibold",
                      "text-primary opacity-0 group-hover:opacity-100",
                      "transition-all duration-300"
                    )}
                  >
                    <span>{t("learnMore")}</span>
                    <ArrowRight
                      className={cn(
                        "w-4 h-4 transition-transform",
                        "group-hover:translate-x-1"
                      )}
                    />
                  </div>
                </div>

                {/* ✨ Bottom accent line */}
                <div
                  className={cn(
                    "absolute bottom-0 left-0 right-0 h-1",
                    "bg-gradient-to-r from-primary via-blue-500 to-primary",
                    "rounded-b-2xl",
                    "scale-x-0 group-hover:scale-x-100",
                    "transition-transform duration-300 origin-left"
                  )}
                />
              </div>
            </motion.div>
          ))}
        </div>

        {/* ✨ Optional CTA at bottom */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
          className="text-center mt-16"
        >
          <p className="text-muted-foreground mb-4">
            {t("wantToSeeMoreFeatures")}
          </p>
          <button
            className={cn(
              "inline-flex items-center gap-2 px-6 py-3",
              "rounded-xl border-2 border-primary/20",
              "bg-background hover:bg-elevated",
              "text-foreground font-semibold",
              "transition-all hover:scale-105",
              "group cursor-pointer"
            )}
            onClick={() => router.push("/features")}
          >
            <span>{t("viewAllFeatures")}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform " />
          </button>
        </motion.div>
      </div>
    </section>
  );
}

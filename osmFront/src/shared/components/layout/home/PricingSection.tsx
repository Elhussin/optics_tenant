/**
 * ✨ PricingSection - محسّن مع Animations و UI/UX Enhancements
 * @description Pricing section مع enhanced cards و smooth transitions
 */

"use client";

import { useState } from "react";
import { useTranslations, useFormatter, useLocale } from "next-intl";
import { Link } from "@/src/app/i18n/navigation";
import { PLAN_LIMITS } from "@/src/shared/constants/plans";
import {
  Users,
  Store,
  Package,
  Check,
  Crown,
  Sparkles,
  Zap,
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/src/shared/utils/cn";

export default function PricingSection() {
  const t = useTranslations("pricingSection");
  const format = useFormatter();
  const locale = useLocale();
  const isRtl = locale === "ar";
  const plans = Object.keys(PLAN_LIMITS) as (keyof typeof PLAN_LIMITS)[];
  const [isYearly, setIsYearly] = useState(false);

  return (
    <section
      className={cn("relative py-24 lg:py-32 overflow-hidden", "bg-background")}
      id="pricing"
    >
      {/* ✨ Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
      </div>

      {/* Grid pattern */}
      <div className="absolute inset-0 bg-grid-primary/[0.02] bg-[size:32px_32px]" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16 lg:mb-20"
        >
          {/* ✨ Badge */}
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
              {t("pricing")}
            </span>
          </motion.div>

          {/* Title */}
          <h2
            className={cn(
              "text-4xl sm:text-5xl lg:text-6xl font-black mb-6",
              "text-foreground"
            )}
          >
            {t("title")}
          </h2>

          {/* Subtitle */}
          <p className="text-lg lg:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            {t("subtitle") ||
              "Simple, transparent pricing for every stage of your business."}
          </p>

          {/* ✨ Enhanced Toggle */}
          <div
            className={cn(
              "inline-flex items-center gap-4 p-1.5 rounded-full",
              "bg-elevated border-2 border-border",
              "shadow-lg"
            )}
          >
            <span
              className={cn(
                "text-sm font-bold px-4 transition-colors",
                !isYearly ? "text-foreground" : "text-muted-foreground"
              )}
            >
              {t("monthly") || "Monthly"}
            </span>

            <button
              dir="ltr"
              onClick={() => setIsYearly(!isYearly)}
              className={cn(
                "relative inline-flex h-8 w-16 items-center rounded-full ",
                "transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                isYearly
                  ? "bg-primary shadow-lg shadow-primary/30"
                  : "bg-border bg-primary/20"
              )}
              aria-label="Toggle pricing"
            >
              <motion.span
                animate={{ x: isYearly !== isRtl ? 32 : 4 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                className="inline-block h-6 w-6 rounded-full bg-white shadow-md"
              />
            </button>

            <span
              className={cn(
                "text-sm font-bold px-4 transition-colors",
                isYearly ? "text-foreground" : "text-muted-foreground"
              )}
            >
              {t("yearly") || "Yearly"}
              <span className="text-green-500 text-xs ml-2 font-bold">
                {t("save20") || "Save 20%"}
              </span>
            </span>
          </div>
        </motion.div>

        {/* ✨ Enhanced Pricing Cards */}
        <div className="grid gap-6 lg:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 max-w-7xl mx-auto">
          {plans.map((plan, index) => {
            const data = t.raw(`plans.${plan}`) as {
              name: string;
              description: string;
              features: string[];
            };
            const planData = PLAN_LIMITS[plan];
            const isPopular = plan === "premium";
            const price = isYearly ? planData.price_year : planData.price_month;
            const period = isYearly
              ? t("year") || "Year"
              : t("month") || "Month";

            return (
              <motion.div
                key={plan}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className={cn(
                  "relative rounded-3xl p-8 flex flex-col justify-between",
                  "border-2 transition-all duration-300",
                  "bg-elevated",
                  isPopular
                    ? [
                        "border-primary shadow-2xl shadow-primary/20",
                        "scale-105 z-10",
                        "bg-gradient-to-b from-primary/5 to-transparent",
                      ]
                    : "border-border hover:border-primary/30 hover:shadow-xl hover:-translate-y-1"
                )}
              >
                {/* ✨ Enhanced Popular Badge */}
                {isPopular && (
                  <motion.div
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className={cn(
                      "absolute -top-4 left-1/2 -translate-x-1/2",
                      "px-4 py-2 rounded-full",
                      "bg-gradient-to-r from-primary to-blue-500",
                      "text-white text-xs font-black uppercase tracking-wider",
                      "shadow-lg flex items-center gap-1.5"
                    )}
                  >
                    <Crown size={14} className="fill-white" />
                    {t("mostPopular") || "MOST POPULAR"}
                  </motion.div>
                )}

                <div>
                  {/* Plan name */}
                  <h3 className="text-2xl font-black text-foreground mb-3">
                    {data.name}
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-muted-foreground mb-6 min-h-[40px]">
                    {data.description}
                  </p>

                  {/* ✨ Enhanced Price */}
                  <div className="mb-8">
                    {planData.price_month === 0 ? (
                      <p className="text-5xl font-black text-foreground">
                        {t("free")}
                      </p>
                    ) : (
                      <div className="flex items-baseline gap-2">
                        <span className="text-5xl font-black text-foreground">
                          ${price}
                        </span>
                        <span className="text-base font-semibold text-muted-foreground">
                          /{period}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Divider */}
                  <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent mb-8" />

                  {/* ✨ Enhanced Features List */}
                  <ul className="space-y-4">
                    {/* Core limits */}
                    <li className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
                        <Users className="w-4 h-4 text-blue-500" />
                      </div>
                      <span className="text-sm">
                        <strong className="text-foreground">
                          {planData.max_users}
                        </strong>
                        <span className="text-muted-foreground ml-1">
                          {t("maxUsers")}
                        </span>
                      </span>
                    </li>

                    <li className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center shrink-0">
                        <Store className="w-4 h-4 text-purple-500" />
                      </div>
                      <span className="text-sm">
                        <strong className="text-foreground">
                          {planData.max_branches}
                        </strong>
                        <span className="text-muted-foreground ml-1">
                          {t("maxBranches")}
                        </span>
                      </span>
                    </li>

                    <li className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center shrink-0">
                        <Package className="w-4 h-4 text-green-500" />
                      </div>
                      <span className="text-sm">
                        <strong className="text-foreground">
                          {format.number(planData.max_products)}
                        </strong>
                        <span className="text-muted-foreground ml-1">
                          {t("maxProducts")}
                        </span>
                      </span>
                    </li>

                    {/* Additional features */}
                    {data.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                          <Check className="w-3 h-3 text-primary" />
                        </div>
                        <span className="text-sm text-muted-foreground leading-tight">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* ✨ Enhanced CTA Button */}
                <Link
                  href={plan === "enterprise" ? "/contact" : `/auth/register?plan=${plan}`}
                  className={cn(
                    "group relative mt-8 w-full py-4 px-6 rounded-xl overflow-hidden",
                    "font-bold text-center",
                    "transition-all duration-300",
                    "hover:scale-105 active:scale-95",
                    isPopular
                      ? [
                          "bg-gradient-to-r from-primary to-blue-500",
                          "text-white shadow-lg hover:shadow-xl hover:shadow-primary/40",
                        ]
                      : "bg-elevated border-2 border-border text-foreground hover:bg-background hover:border-primary/50"
                  )}
                >
                  {/* Shine effect for popular plan */}
                  {isPopular && (
                    <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700" />
                  )}

                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {isPopular && <Zap className="w-4 h-4" />}
                    {plan === "enterprise" ?  t("contactUs") : t("choosePlan")}
                  </span>
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* ✨ Optional notice */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
          className="text-center text-sm text-muted-foreground mt-12"
        >
          {t("allPlansInclude") || "All plans include 24/7 support and updates"}
        </motion.p>
      </div>
    </section>
  );
}

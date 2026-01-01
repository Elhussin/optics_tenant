"use client";

import { useTranslations, useFormatter, useLocale } from "next-intl";
import { Users, Store, Package, Check, Sparkles, Building2, Crown } from "lucide-react";
import { FetchData } from "@/src/shared/api/api";
import { useEffect, useState } from "react";
import { useUser } from "@/src/features/auth/hooks/UserContext";
import { Link } from "@/src/app/i18n/navigation";
import { PricingPlansProps } from "../types";
import { motion } from "framer-motion";
import { clsx } from "clsx";

export default function PricingPlans({ clientId }: PricingPlansProps) {
  const t = useTranslations("pricingSection");
  const format = useFormatter();
  const locale = useLocale();
  const isRtl = locale === 'ar';
  const { user } = useUser();
  const [plans, setPlans] = useState<any>(null);
  const [billingCycle, setBillingCycle] = useState<"month" | "year">("month");

  useEffect(() => {
    (async () => {
      const data = await FetchData({ url: `/api/tenants/subscription-plans/` });
      if (user) {
        setPlans(data.results.filter((p: any) => p.name !== "trial"));
      } else {
        setPlans(data.results);
      }
    })();
  }, [user]);

  // Helper to get visually distinct styles for plans
  const getPlanStyle = (name: string) => {
    switch (name?.toLowerCase()) {
      case "basic":
        return {
          icon: <Building2 className="w-6 h-6" />,
          color: "blue",
          borderColor: "border-blue-100 dark:border-blue-900/30",
          bgColor: "bg-blue-50/50 dark:bg-blue-900/10",
          badge: null
        };
      case "premium":
      case "pro":
        return {
          icon: <Sparkles className="w-6 h-6" />,
          color: "indigo",
          borderColor: "border-indigo-200 dark:border-indigo-900/50",
          bgColor: "bg-indigo-50/50 dark:bg-indigo-900/10",
          badge: t("popular")
        };
      case "enterprise":
        return {
          icon: <Crown className="w-6 h-6" />,
          color: "amber",
          borderColor: "border-amber-200 dark:border-amber-900/50",
          bgColor: "bg-amber-50/50 dark:bg-amber-900/10",
          badge: t("bestValue")
        };
      default:
        return {
          icon: <Package className="w-6 h-6" />,
          color: "gray",
          borderColor: "border-gray-100 dark:border-gray-700",
          bgColor: "bg-gray-50/50 dark:bg-gray-800/50",
          badge: null
        };
    }
  };

  return (
    <section className="py-16 bg-white dark:bg-gray-900" id="pricing">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <motion.h2
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl font-bold mb-4 text-gray-900 dark:text-white"
          >
            {t("title")}
          </motion.h2>

          {/* Billing Cycle Toggle */}
          {user && (
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="flex items-center justify-center mt-8"
            >
              <div className="bg-gray-100 dark:bg-gray-800 p-1 rounded-xl inline-flex relative">
                <motion.div
                  className="absolute inset-y-1 left-1 bg-white dark:bg-gray-700 shadow-sm rounded-lg"
                  initial={false}
                  animate={{
                    x: billingCycle === "month" ? (isRtl ? "100%" : "0%") : (isRtl ? "0%" : "100%"),
                    width: "48%"
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
                <button
                  onClick={() => setBillingCycle("month")}
                  className={clsx(
                    "relative z-10 px-6 py-2 text-sm font-medium transition-colors rounded-lg",
                    billingCycle === "month" ? "text-gray-900 dark:text-white" : "text-gray-500 dark:text-gray-400"
                  )}
                >
                  {t("monthly")}
                </button>
                <button
                  onClick={() => setBillingCycle("year")}
                  className={clsx(
                    "relative z-10 px-6 py-2 text-sm font-medium transition-colors rounded-lg",
                    billingCycle === "year" ? "text-gray-900 dark:text-white" : "text-gray-500 dark:text-gray-400"
                  )}
                >
                  {t("yearly")}
                </button>
              </div>
            </motion.div>
          )}
        </div>

        <div className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 max-w-7xl mx-auto">
          {plans?.length > 0 &&
            plans.map((plan: any, index: number) => {
              const style = getPlanStyle(plan.name);
              const isYearly = billingCycle === "year";
              const price = isYearly ? plan.year_price : plan.month_price;
              const period = isYearly ? plan.field_labels?.year_price : plan.field_labels?.month_price;

              // Don't show year option if price is 0 (unless it's the only option)
              if (isYearly && plan.year_price === "0.00") return null;

              return (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className={`
                    relative flex flex-col justify-between p-8 rounded-3xl border transition-all duration-300 hover:shadow-xl dark:shadow-none
                    ${style.borderColor} bg-white dark:bg-gray-800
                    ${plan.name === 'premium' || plan.name === 'pro' ? 'ring-2 ring-indigo-500/20 dark:ring-indigo-400/20 scale-105 z-10' : ''}
                  `}
                >
                  {style.badge && (
                    <div className={`absolute top-0 right-0 -mt-3 mr-6 px-3 py-1 bg-gradient-to-r from-${style.color}-500 to-${style.color}-600 text-white text-xs font-bold uppercase rounded-full shadow-lg`}>
                      {style.badge}
                    </div>
                  )}

                  <div>
                    <div className="flex items-center gap-4 mb-6">
                      <div className={`p-3 rounded-2xl ${style.bgColor} text-${style.color}-600 dark:text-${style.color}-400`}>
                        {style.icon}
                      </div>
                      <div>
                        {/* Translate plan name safely */}
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white capitalize">
                          {t(plan.name) !== "pricingSection" ? t(plan.name) : plan.name}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {plan.name === 'enterprise' ? t('forLargeScaleOrganizations') : t('perfectForGrowingBusinesses')}
                        </p>
                      </div>
                    </div>

                    <div className="mb-8">
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-extrabold text-gray-900 dark:text-white">
                          ${Math.floor(Number(price))}
                        </span>
                        <span className="text-gray-500 dark:text-gray-400 font-medium">/{period}</span>
                      </div>
                      {isYearly && (
                        <p className="text-sm text-green-600 font-medium mt-2">{t('billedAnnually')}</p>
                      )}
                    </div>

                    <div className="space-y-4 mb-8">
                      <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                        <div className="p-1.5 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
                          <Users className="w-4 h-4" />
                        </div>
                        <span className="font-medium">{plan.max_users} {t("maxUsers")}</span>
                      </div>
                      <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                        <div className="p-1.5 rounded-full bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400">
                          <Store className="w-4 h-4" />
                        </div>
                        <span className="font-medium">{plan.max_branches} {t("maxBranches")}</span>
                      </div>
                      <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                        <div className="p-1.5 rounded-full bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400">
                          <Package className="w-4 h-4" />
                        </div>
                        <span className="font-medium">
                          {format.number(plan.max_products)} {t("maxProducts")}
                        </span>
                      </div>

                      {/* Dynamic Features */}
                      {plan.features?.map((feature: string, idx: number) => (
                        <div key={idx} className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                          <div className="p-1.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500">
                            <Check className="w-3 h-3" />
                          </div>
                          <span className="text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Action Button */}
                  {!user ? (
                    <Link
                      href={`/auth/register?plan=${plan.name}`}
                      className={`
                        w-full py-3 px-6 rounded-xl font-semibold text-center transition-all duration-200
                        ${plan.name === "enterprise"
                          ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100"
                          : "bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg shadow-blue-600/20"
                        }
                      `}
                    >
                      {plan.name === "enterprise" ? t("contactUs") : t("choosePlan")}
                    </Link>
                  ) : (
                    <Link
                      href={`/payment?planId=${plan.id}&direction=${period}&amount=${price}&planName=${plan.name}&clientId=${clientId}&planDirection=${isYearly ? t('year') : t('month')}`}
                      className={`
                        w-full py-3 px-6 rounded-xl font-semibold text-center transition-all duration-200
                        ${plan.name === "enterprise"
                          ? "bg-gray-100 text-gray-900 hover:bg-gray-200 dark:bg-gray-700 dark:text-white"
                          : "bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg shadow-blue-600/20"
                        }
                      `}
                    >
                      {t("choosePlan")}
                    </Link>
                  )}
                </motion.div>
              );
            })}
        </div>
      </div>
    </section>
  );
}

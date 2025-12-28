"use client";
import { useState } from 'react';
import { useTranslations, useFormatter, useLocale } from 'next-intl';
import { Link } from '@/src/app/i18n/navigation';
import { PLAN_LIMITS } from '@/src/shared/constants/plans';
import { Users, Store, Package, Check, Crown } from 'lucide-react';
import { motion } from 'framer-motion';

export default function PricingSection() {
  const t = useTranslations('pricingSection');
  const format = useFormatter();
  const locale = useLocale();
  const isRtl = locale === 'ar';
  const plans = Object.keys(PLAN_LIMITS) as (keyof typeof PLAN_LIMITS)[];
  const [isYearly, setIsYearly] = useState(false);

  return (
    <section className="py-24 bg-gray-50 dark:bg-gray-900" id="pricing">
      <div className="container mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white">
            {t('title')}
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
            {t('subtitle') || "Simple, transparent pricing for every stage of your business."}
          </p>

          {/* Toggle */}
          <div className="flex items-center justify-center gap-4">
            <span className={`text-sm font-medium ${!isYearly ? 'text-gray-900 dark:text-white' : 'text-gray-500'}`}>{t('monthly') || "Monthly"}</span>
            <button
              dir="ltr"
              onClick={() => setIsYearly(!isYearly)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${isYearly ? 'bg-primary' : 'bg-gray-200'}`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isYearly !== isRtl ? 'translate-x-6' : 'translate-x-1'}`}
              />
            </button>
            <span className={`text-sm font-medium ${isYearly ? 'text-gray-900 dark:text-white' : 'text-gray-500'}`}>
              {t('yearly') || "Yearly"} <span className="text-green-500 text-xs ml-1">(Save 20%)</span>
            </span>
          </div>
        </motion.div>

        <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 md:grid-cols-3 max-w-7xl mx-auto">
          {plans.map((plan, index) => {
            const data = t.raw(`plans.${plan}`) as {
              name: string;
              description: string;
              features: string[];
            };
            const planData = PLAN_LIMITS[plan];
            const isPopular = plan === 'premium';
            const price = isYearly ? planData.price_year : planData.price_month;
            const period = isYearly ? t('year') || "Year" : t('month') || "Month";

            return (
              <motion.div
                key={plan}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={`relative bg-white dark:bg-gray-800 rounded-2xl p-6 flex flex-col justify-between border transition-all duration-300 ${isPopular
                  ? 'border-primary shadow-xl scale-105 z-10'
                  : 'border-gray-200 dark:border-gray-700 shadow-md hover:shadow-lg'
                  }`}
              >
                {isPopular && (
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-sm">
                    <Crown size={12} fill="currentColor" /> {t('mostPopular') || "MOST POPULAR"}
                  </div>
                )}

                <div>
                  <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
                    {data.name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 min-h-[40px]">
                    {data.description}
                  </p>

                  <div className="my-6">
                    <p className="text-4xl font-bold text-gray-900 dark:text-white">
                      {planData.price_month === 0 ? t('free') : `$${price}`}
                      {planData.price_month !== 0 && <span className="text-base font-normal text-gray-500 ml-1">/{period}</span>}
                    </p>
                  </div>

                  <div className="h-px w-full bg-gray-100 dark:bg-gray-700 mb-6" />

                  <ul className="text-sm text-start space-y-3 text-gray-700 dark:text-gray-300">
                    <li className="flex items-center gap-3">
                      <Users className="w-5 h-5 text-blue-500 shrink-0" />
                      <span>{t('maxUsers')}: <strong>{planData.max_users}</strong></span>
                    </li>
                    <li className="flex items-center gap-3">
                      <Store className="w-5 h-5 text-purple-500 shrink-0" />
                      <span>{t('maxBranches')}: <strong>{planData.max_branches}</strong></span>
                    </li>
                    <li className="flex items-center gap-3">
                      <Package className="w-5 h-5 text-green-500 shrink-0" />
                      <span>{t('maxProducts')}: <strong>{format.number(planData.max_products)}</strong></span>
                    </li>
                    {data.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                        <span className="leading-tight">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Link
                  href={`/auth/register?plan=${plan}`}
                  className={`mt-8 w-full py-3 px-4 rounded-xl font-bold transition-all transform active:scale-95 ${isPopular
                    ? 'bg-primary text-white hover:bg-primary-dark shadow-lg hover:shadow-primary/30'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                >
                  {plan === 'enterprise' ? t('contactUs') : t('choosePlan')}
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

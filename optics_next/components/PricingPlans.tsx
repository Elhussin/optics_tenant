"use client";
import { useTranslations } from 'next-intl';
import { PLAN_LIMITS } from '@/constants/plans';
import PayPalButton from '@/components/PayPalButton';
import { Users, Store, Package, Check } from 'lucide-react';

type PricingPlansProps = {
  clientId: string;
};

export default function PricingPlans({ clientId }: PricingPlansProps) {
  const t = useTranslations('pricingSection');
  const plans = Object.keys(PLAN_LIMITS) as (keyof typeof PLAN_LIMITS)[];

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <h2 className="text-2xl font-bold text-center mb-8">{t('title')}</h2>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {plans.filter(p => p !== 'trial').map((plan) => {
          const details = PLAN_LIMITS[plan];
          const features = t.raw(`plans.${plan}.features`) as string[];
          return (
            <div
              key={plan}
              className="p-6 rounded-xl shadow-md border bg-surface flex flex-col justify-between"
            >
              <div>
                <h3 className="text-xl font-semibold mb-2 capitalize">{t(`plans.${plan}.name`)}</h3>
                <p className="text-2xl font-bold text-blue-600 mb-4">
                  ${details.price_month}/<span className="text-lg">{t('month')}</span>
                </p>
                {details.price_year !== 0 && (
                  <p className="text-2xl font-bold text-blue-600 mb-4">
                    ${details.price_year}/<span className="text-lg">{t('year')}</span>
                  </p>
                )}
                {/* <p className="text-sm text-gray-500 mb-4">
                  {t('duration')}: {details.duration_days} {t('days')}
                </p> */}
                <ul className="space-y-2 text-gray-700 mb-4">
                  <li className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-500" /> {t('maxUsers')}: {details.max_users}
                  </li>
                  <li className="flex items-center gap-2">
                    <Store className="w-4 h-4 text-purple-500" /> {t('maxBranches')}: {details.max_branches}
                  </li>
                  <li className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-green-500" /> {t('maxProducts')}: {details.max_products.toLocaleString()}
                  </li>
                  {features.map((feature, index) =>    (
                    <li key={index} className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" /> {feature}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex justify-center gap-4">
                <PayPalButton clientId={clientId} plan={plan} direction="month" label={t('month')} />
                <PayPalButton clientId={clientId} plan={plan} direction="year" label={t('year')} />
              </div>
            </div>
          );
        })}
        
      </div>
    </div>
  );
}

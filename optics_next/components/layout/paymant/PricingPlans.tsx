"use client";
import { useTranslations } from 'next-intl';
import { PLAN_LIMITS } from '@/constants/plans';
import PayPalButton from '@/components/layout/paymant/PayPalButton';
import { Users, Store, Package, Check, Link as LinkIcon } from 'lucide-react';
import {FetchData} from '@/lib/api/api';
import { useEffect, useState } from 'react';
import { useUser } from '@/lib/context/userContext';
import { Link } from '@/app/i18n/navigation';
type PricingPlansProps = {
  clientId?: string;
};

export default function PricingPlans({ clientId }: PricingPlansProps) {
  const t = useTranslations('pricingSection');
  const { user } = useUser();
  const [plans, setPlans] = useState<any>(null);
    useEffect(() => {
      (async () => {
        const data = await FetchData({url: `/api/tenants/subscription-plans/` });
        if(user)
          setPlans(data.filter((p:any) => p.name !== "trial")) 
        else
          setPlans(data)
        })();

    }, []);

  return (
    <section className="py-20 bg-gray-50 dark:bg-gray-900" id="pricing">
          <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-12 text-gray-900 dark:text-white">
          {t('title')}
        </h2>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 md:grid-cols-3">
      {plans?.length > 0 && plans
        .map((plan:any) => (
          <div
            key={plan.id}
            className="bg-white dark:bg-gray-800 shadow-md rounded-2xl p-6 flex flex-col justify-between border hover:scale-[1.02] transition-transform"
          >
            <div>
              {/* اسم الباقة */}
              <h3 className="text-xl font-semibold mb-2">
                {t(plan.name)}
              </h3>

              {/* السعر الشهري */}
              <p className="text-2xl font-bold text-blue-600 mb-4">
                ${plan.month_price}/
                <span className="text-lg">
                  {plan.field_labels.month_price}
                </span>
              </p>

              {/* السعر السنوي */}
              {plan.year_price !== "0.00" && (
                <p className="text-2xl font-bold text-blue-600 mb-4">
                  ${plan.year_price}/
                  <span className="text-lg">
                    {plan.field_labels.year_price}
                  </span>
                </p>
              )}

              {/* الخصائص */}
              <ul className="space-y-2 text-gray-700 mb-4">
                <li className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-500" />{" "}
                  {plan.field_labels.max_users}: {plan.max_users}
                </li>
                <li className="flex items-center gap-2">
                  <Store className="w-4 h-4 text-purple-500" />{" "}
                  {plan.field_labels.max_branches}: {plan.max_branches}
                </li>
                <li className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-green-500" />{" "}
                  {plan.field_labels.max_products}:{" "}
                  {plan.max_products.toLocaleString()}
                </li>

                {/* لو فيه Features من الباكيند */}
                {plan.features?.map((feature: string, index: number) => (
                  <li key={index} className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" /> {feature}
                  </li>
                ))}
              </ul>
            </div>

            {/* أزرار الدفع */}

             {!user && <Link
                href={`/auth/register?plan=${plan.name}`}
                className="mt-6 w-full py-2 px-4 bg-primary text-white rounded-lg hover:bg-opacity-90 transition"
              >
                {plan.name === 'enterprise' ? t('contactUs') : t('choosePlan')}
              </Link>}


           {user && 
           <div className="flex justify-center gap-4">
              <Link
                href={`/payment?planId=${plan.id}&direction=${plan.field_labels.month_price}&amount=${plan.month_price}&planName=${plan.name}&clientId=${clientId}`}
                className="mt-6 w-full py-2 px-4 bg-primary text-white rounded-lg hover:bg-opacity-90 transition"
              >
                {plan.field_labels.month_price}
              </Link>
              <Link
                href={`/payment?planId=${plan.id}&direction=${plan.field_labels.year_price}&amount=${plan.year_price}&planName=${plan.name}&clientId=${clientId}`}
                className="mt-6 w-full py-2 px-4 bg-primary text-white rounded-lg hover:bg-opacity-90 transition"
              >
                {plan.field_labels.year_price}
              </Link>
            </div>
            }
          </div>
        ))}
    </div>
    </div>
    </section>
  );
}


  

  // return (
  //   <div className="max-w-6xl mx-auto py-8 px-4">
  //     <h2 className="text-2xl font-bold text-center mb-8">{t('title')}</h2>

  //     <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
  //       {plans.filter(p => p !== 'trial').map((plan) => {
  //         const details = PLAN_LIMITS[plan];
  //         const features = t.raw(`plans.${plan}.features`) as string[];
  //         return (
  //           <div
  //             key={plan}
  //             className="p-6 rounded-xl shadow-md border bg-surface flex flex-col justify-between"
  //           >
  //             <div>
  //               <h3 className="text-xl font-semibold mb-2 capitalize">{t(`plans.${plan}.name`)}</h3>
  //               <p className="text-2xl font-bold text-blue-600 mb-4">
  //                 ${details.price_month}/<span className="text-lg">{t('month')}</span>
  //               </p>
  //               {details.price_year !== 0 && (
  //                 <p className="text-2xl font-bold text-blue-600 mb-4">
  //                   ${details.price_year}/<span className="text-lg">{t('year')}</span>
  //                 </p>
  //               )}
  //               {/* <p className="text-sm text-gray-500 mb-4">
  //                 {t('duration')}: {details.duration_days} {t('days')}
  //               </p> */}
  //               <ul className="space-y-2 text-gray-700 mb-4">
  //                 <li className="flex items-center gap-2">
  //                   <Users className="w-4 h-4 text-blue-500" /> {t('maxUsers')}: {details.max_users}
  //                 </li>
  //                 <li className="flex items-center gap-2">
  //                   <Store className="w-4 h-4 text-purple-500" /> {t('maxBranches')}: {details.max_branches}
  //                 </li>
  //                 <li className="flex items-center gap-2">
  //                   <Package className="w-4 h-4 text-green-500" /> {t('maxProducts')}: {details.max_products.toLocaleString()}
  //                 </li>
  //                 {features.map((feature, index) =>    (
  //                   <li key={index} className="flex items-center gap-2">
  //                     <Check className="w-4 h-4 text-green-500" /> {feature}
  //                   </li>
  //                 ))}
  //               </ul>
  //             </div>
  //             <div className="flex justify-center gap-4">
  //               <PayPalButton clientId={clientId} plan={plan} direction="month" label={t('month')} />
  //               <PayPalButton clientId={clientId} plan={plan} direction="year" label={t('year')} />
  //             </div>
  //           </div>
  //         );
  //       })}
        
  //     </div>
  //   </div>
  // );

"use client";
import { useTranslations } from 'next-intl';
import {Link} from '@/app/i18n/navigation';
export default function PricingSection() {
  const t = useTranslations('pricingSection');
  const plans = ['trial','basic', 'premium', 'enterprise'] as const;

  return (
    <section className="py-20 bg-gray-50 dark:bg-gray-900" id="pricing">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold mb-12 text-gray-900 dark:text-white">
          {t('title')}
        </h2>

        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 md:grid-cols-3">
          {plans.map((plan) => {
            const data = t.raw(`plans.${plan}`) as {
              name: string;
              price: string;
              description: string;
              features: string[];
            };

            return (
              <div
                key={plan}
               
                className="bg-white dark:bg-gray-800 shadow-md rounded-2xl p-6 flex flex-col justify-between border hover:scale-[1.02] transition-transform"
              >
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
                    {data.name}
                  </h3>
                  <p className="text-3xl font-bold my-2 text-primary">{data.price}</p>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">{data.description}</p>

                  <ul className="text-sm text-start space-y-2 text-gray-700 dark:text-gray-300 " >
                    {data.features.map((feature, i) => (
                      <li key={i} className="before:content-['✓'] before:text-primary before:mr-2">
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
                <Link href={`/auth/register?plan=${plan}`} className="mt-6 w-full py-2 px-4 bg-primary text-white rounded-lg hover:bg-opacity-90 transition">
      
                  {plan === 'enterprise' ? 'Contact Us' : 'Choose Plan'}
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

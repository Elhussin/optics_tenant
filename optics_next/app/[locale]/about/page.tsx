"use client"
// import { generateMetadata } from '@/lib/utils/metadata';
import {Link} from '@/app/i18n/navigation'
import { useTranslations } from 'next-intl';

const metadata = {
  title: 'About | O-S-M',
  description: 'stay updated with the latest news, tips, and insights from the O-S-M team.Learn more about Optical Store Management [O-S-M], a comprehensive system for managing optical shops and businesses.',
};

export default function AboutPage() {
  const t = useTranslations('about');
  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-surface rounded-xl shadow-md space-y-8">
      <h1 className="text-3xl font-bold text-center text-gray-900 dark:text-white">
        {t('title')}
      </h1>

      <section className="space-y-4 text-gray-700 dark:text-gray-200">
        <p>{t('description')}</p>

        <h2 className="text-xl font-semibold">{t('featuresTitle')}</h2>
        <ul className="list-disc list-inside space-y-1">
          <li>{t('features.inventory')}</li>
          <li>{t('features.orders')}</li>
          <li>{t('features.billing')}</li>
          <li>{t('features.accounting')}</li>
          <li>{t('features.reports')}</li>
          <li>{t('features.analytics')}</li>
        </ul>

        <h2 className="text-xl font-semibold">{t('techTitle')}</h2>
        <p>{t('techDescription')}</p>
      </section>

      <div className="flex justify-center gap-4 pt-4">
        <Link
          href="/auth/register"
          className="px-6 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
        >
          {t('startTrial')}
        </Link>
        <Link
          href="/contact"
          className="px-6 py-2 rounded-lg border border-blue-600 text-blue-600 font-semibold hover:bg-blue-50 transition"
        >
          {t('contactUs')}
        </Link>
      </div>
    </div>
  );
}

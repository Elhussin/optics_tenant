
import { generateMetadata } from '@/lib/utils/metadata';
import { Metadata } from 'next';
import {getTranslations} from 'next-intl/server';

export const metadata:Metadata = generateMetadata({
  title: 'About | O-S-M',
  description: 'About  Optical System Management[O-S-M] ',
});


export default async function AboutPage({params}: {params: {locale: string}}) {
    const {locale} = await params;
    const t = await getTranslations({locale, namespace: 'about'});
    return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-semibold">{t('title')}</h2>
      <p className="mt-4 text-gray-700">
        {t('description')}</p>
    </div>
  );
}

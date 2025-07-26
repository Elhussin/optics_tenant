
import { Metadata } from 'next';
import { generateMetadata } from '@/lib/utils/metadata';


export const metadata: Metadata = generateMetadata({
  title: 'HomePage',
  description: 'HomePage to O-S-M',
  keywords: ['optical', 'system', 'management', 'O-S-M','HomePage',"بصريات","ادارة"],
  openGraphType: 'website',
  twitterCardType: 'summary',
});

import { getTranslations } from 'next-intl/server';

import {Link} from '@/app/i18n/navigation';
 

export default async function HomePage({params}: {params: {locale: string}}) {
  const {locale} = await params;
  const t = await getTranslations({locale, namespace: 'HomePage'});

  return (
    <div>
    
      <h2 className="text-2xl font-semibold">{t('title')}</h2>
      <p className="mt-4">{t('description')}</p>
      <Link href="/about">About</Link>
    </div>
  );
}

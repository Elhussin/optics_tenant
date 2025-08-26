
// 'use client';
// import {NotFoundPage} from "@/components/NotFound";
// export default function NotFound(){
//   return(
//     <NotFoundPage/>
//   )
// }


import { getTranslations, getLocale } from 'next-intl/server';
// import {Link} from '@/app/i18n/navigation'
import Link from 'next/link';
export default async function NotFound(params: { locale: string }) {
  const { locale } = await params;
  const rtl = locale === 'ar';
  const dir = rtl ? 'rtl' : 'ltr';
    const t = await getTranslations({ locale, namespace: 'NotFound' });

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center p-4" dir={dir}>
      <h1 className="text-4xl font-bold mb-4">{t('title')}</h1>
      <p className="text-lg mb-6">{t('description')}</p>
      <Link href="/" className="text-blue-600 hover:underline">
        {t('goHome')}
      </Link>
    </div>
  );
}
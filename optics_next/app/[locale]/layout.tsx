

import { Cairo, Inter } from 'next/font/google';
import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { notFound } from 'next/navigation';
import { routing } from '@/app/i18n/routing';
import { AsideProvider } from '@/lib/context/AsideContext';
import { UserProvider } from '@/lib/context/userContext';
import { generateMetadata } from '@/lib/utils/metadata';
import { Metadata } from 'next';
const cairo = Cairo({ subsets: ['arabic'], weight: ['400', '600', '700'], variable: '--font-alt' });
const inter = Inter({ subsets: ['latin'], weight: ['400', '600', '700'], variable: '--font-main' });


export const metadata:Metadata = generateMetadata({
  title: 'O-S-M',
  description: 'Opticl Store Management System',
  canonicalUrl: 'https://solovizion.com/products/sunglasses-2025',
  openGraphImage: 'https://solovizion.com/images/products/sunglasses-og.jpg',
  icons: {
    icon: '/media/logo.png', // path relative to the public directory
    shortcut: '/media/logo.png',
    apple: '/media/logo.png',
    other: [
      {
        rel: 'apple-touch-icon-precomposed',
        url: '/media/logo.png',
      },
    ],
  },
});

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  const dir = locale === 'ar' ? 'rtl' : 'ltr';

  return (
    <div dir={dir} className={`${cairo.variable} ${inter.variable}`} data-theme="dark">
      <NextIntlClientProvider locale={locale}>
        <UserProvider>
          <AsideProvider>{children}</AsideProvider>
        </UserProvider>
      </NextIntlClientProvider>
    </div>
  );
}

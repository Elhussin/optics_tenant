
import { Geist, Geist_Mono ,Cairo, Inter  } from 'next/font/google';
import '@/styles/globals.css';
import { AsideProvider } from '@/lib/context/AsideContext';
import { UserProvider } from '@/lib/context/userContext';
import {NextIntlClientProvider, hasLocale} from 'next-intl';
import {notFound} from 'next/navigation';
import {routing} from '@/app/i18n/routing';
import { Metadata } from 'next';

const cairo = Cairo({ subsets: ['arabic'], weight: ['400', '600', '700'], variable: '--font-alt' });
const inter = Inter({ subsets: ['latin'], weight: ['400', '600', '700'], variable: '--font-main' });


export const metadata: Metadata = {
  title: 'O-S-M',
  description: 'O-S-M',
  icons: {
    icon: [
      {
        media: '(prefers-color-scheme: light)',
        url: '/logo.png', // Assuming icon-light.png is in the public directory or app/
        href: '/logo.png',
      },
      {
        media: '(prefers-color-scheme: dark)',
        url: '/logo.png', // Assuming icon-dark.png is in the public directory or app/
        href: '/logo.png',
      },
    ],
    apple: '/logo.png', // Assuming apple-icon.png is in the public directory or app/
  },
};

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{locale: string}>;
}) {
  // Ensure that the incoming `locale` is valid
  const {locale} = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
 
 const dir = locale === 'ar' ? 'rtl' : 'ltr';
 

  return (
    <html lang={locale} dir={dir} data-theme="dark" className={`${cairo.variable} ${inter.variable} `}>
      <body>

          <NextIntlClientProvider locale={locale}>
          <UserProvider>
            <AsideProvider>
              {children}
            </AsideProvider>
            </UserProvider>
          </NextIntlClientProvider>

      </body>
    </html>
  );
}
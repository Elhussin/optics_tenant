
import { Geist, Geist_Mono } from 'next/font/google';
// import '@/styles/globals.css';
import '@/styles/styles.css';
import { AsideProvider } from '@/lib/context/AsideContext';
import { UserProvider } from '@/lib/context/userContext';
import {NextIntlClientProvider, hasLocale} from 'next-intl';
import {notFound} from 'next/navigation';
import {routing} from '@/app/i18n/routing';
 

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });



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
    <html lang={locale} dir={dir} data-theme="dark" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>
        <UserProvider>
          <NextIntlClientProvider locale={locale}>
            <AsideProvider>
              {children}
            </AsideProvider>
          </NextIntlClientProvider>
        </UserProvider>
      </body>
    </html>
  );
}
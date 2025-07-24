
import { Geist, Geist_Mono ,Cairo, Inter  } from 'next/font/google';
import '@/styles/globals.css';
import { AsideProvider } from '@/lib/context/AsideContext';
import { UserProvider } from '@/lib/context/userContext';
import {NextIntlClientProvider, hasLocale} from 'next-intl';
import {notFound} from 'next/navigation';
import {routing} from '@/app/i18n/routing';


const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });


const cairo = Cairo({ subsets: ['arabic'], weight: ['400', '600', '700'], variable: '--font-alt' });
const inter = Inter({ subsets: ['latin'], weight: ['400', '600', '700'], variable: '--font-main' });



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
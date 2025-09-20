
import { Cairo, Inter } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import "@/styles/globals.css";
import { routing } from "@/app/i18n/routing";
import { AsideProvider } from "@/lib/contexts/AsideContext";
import { UserProvider } from "@/lib/contexts/userContext";
import { notFound } from "next/navigation";
import  {getTrenMessages} from "@/utils/getTrenMessages";

const cairo = Cairo({
  subsets: ["arabic"],
  weight: ["400", "600", "700"],
  variable: "--font-alt",
});
const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-main",
});


export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const { locale } =await  params;

  if (!routing.locales.includes(locale as "en" | "ar")) {
    notFound();
  }


  let messages;
  try {
   messages = await getTrenMessages(locale);
  } catch (error) {
    notFound();
  }

  const dir = locale === "ar" ? "rtl" : "ltr";

  return (
    <html lang={locale}>
      <body dir={dir} className={`${cairo.variable} ${inter.variable}`} data-theme="dark">
        <NextIntlClientProvider locale={locale} messages={messages}>
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

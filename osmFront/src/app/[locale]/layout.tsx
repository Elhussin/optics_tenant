// src/app/[locale]/layout.tsx
import { Cairo, Inter } from "next/font/google";
import "@/src/styles/globals.css";
import { routing } from "@/src/app/i18n/routing";
import { notFound } from "next/navigation";
import { getTrenMessages } from "@/src/shared/utils/getTrenMessages";
import ClientProviders from "@/src/shared/hooks/ClientProviders";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "My App",
  description: "My cool Next.js app",
  icons: {
    icon: "/media/icon.png",
    shortcut: "/media/icon.png",
    apple: "/media/icon.png",
  },
};

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
  const { locale } = params;

  if (!routing.locales.includes(locale as "en" | "ar")) {
    notFound();
  }

  let messages: Record<string, any>;
  try {
    messages = await getTrenMessages(locale);
  } catch (error) {
    notFound();
  }

  const dir = locale === "ar" ? "rtl" : "ltr";

  return (
    <html lang={locale}>
      <body dir={dir} className={`${cairo.variable} ${inter.variable}`} data-theme="dark">
        <ClientProviders locale={locale} messages={messages}>
          {children}
        </ClientProviders>
      </body>
    </html>
  );
}

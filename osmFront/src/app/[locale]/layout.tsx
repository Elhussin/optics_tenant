import { cairo, inter } from "@/src/styles/fonts";
import "@/src/styles/app.css";
import { routing } from "@/src/app/i18n/routing";
import { notFound } from "next/navigation";
import { getTrenMessagesFiles } from "@/src/shared/utils/getTrenMessagesFiles";
import ClientProviders from "@/src/shared/hooks/ClientProviders";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    template: '%s | OSM',
    default: 'OSM - Optical Store Management',
  },
  description: "Advanced Optical Store Management Solution",
  icons: {
    icon: "/media/icon.jpg",
    shortcut: "/media/icon.jpg",
    apple: "/media/icon.jpg",
  },
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Validate that the incoming `locale` parameter is valid
  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  // Load messages for simple I18n
  let messages;
  try {
    messages = await getTrenMessagesFiles(locale);
  } catch (error) {
    notFound();
  }

  const dir = locale === "ar" ? "rtl" : "ltr";

  // suppressHydrationWarning is essential when using next-themes
  // to avoid warnings about mismatched attributes (class/style)
  return (
    <html lang={locale} dir={dir} suppressHydrationWarning>
      <body
        className={`${cairo.variable} ${inter.variable} font-sans antialiased`}
        suppressHydrationWarning
      >
        <ClientProviders locale={locale} messages={messages}>
          {children}
        </ClientProviders>
      </body>
    </html>
  );
}

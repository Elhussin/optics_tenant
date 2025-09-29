// src/shared/hooks/ClientProviders.tsx
"use client";

import React from "react";
import { NextIntlClientProvider } from "next-intl";
import { UserProvider } from "@/src/features/auth/hooks/UserContext";
import { AsideProvider } from "@/src/shared/contexts/AsideContext";
import { Providers } from "@/src/shared/hooks/providers";

interface Props {
  children: React.ReactNode;
  locale: string;
  messages: Record<string, any>;
}

export default function ClientProviders({ children, locale, messages }: Props) {
  return (
    <NextIntlClientProvider locale={locale} messages={messages}    timeZone={process.env.NEXT_PUBLIC_TIMEZONE}>
      <UserProvider>
        <AsideProvider>
          <Providers>
            {children}
          </Providers>
        </AsideProvider>
      </UserProvider>
    </NextIntlClientProvider>
  );
}

// src/shared/hooks/ClientProviders.tsx
"use client";

import React, { useEffect } from "react";
import { NextIntlClientProvider } from "next-intl";
import { UserProvider } from "@/src/features/auth/hooks/UserContext";
import { AsideProvider } from "@/src/shared/contexts/AsideContext";
import { Providers } from "@/src/shared/hooks/providers";
import { SearchProvider } from "@/src/shared/contexts/SearchContext";
import { SearchButtonProvider } from "@/src/shared/contexts/SearchButtonContext";
import { TenantProvider } from "@/src/shared/contexts/TenantContext";
import { z } from "zod";

interface Props {
  children: React.ReactNode;
  locale: string;
  messages: Record<string, any>;
}

const customErrorMap = (locale: string): any => {
  return (issue: any, ctx: any) => {
    let message = ctx.defaultError;

    if (locale === "ar") {
      switch (issue.code) {
        case "invalid_type":
          if (issue.received === "undefined" || issue.received === "null") {
            message = "هذا الحقل مطلوب";
          } else {
            message = `نوع البيانات غير صالح (متوقع ${issue.expected})`;
          }
          break;
        case "too_small":
          if (issue.type === "string") {
            if (issue.minimum === 1) message = "هذا الحقل مطلوب";
            else message = `يجب أن يحتوي النص على ${issue.minimum} أحرف على الأقل`;
          } else if (issue.type === "number") {
            message = `يجب أن تكون القيمة أكبر من أو تساوي ${issue.minimum}`;
          }
          break;
        case "too_big":
          if (issue.type === "string") {
            message = `يجب أن يحتوي النص على ${issue.maximum} أحرف كحد أقصى`;
          } else if (issue.type === "number") {
            message = `يجب أن تكون القيمة أصغر من أو تساوي ${issue.maximum}`;
          }
          break;
        case "invalid_string":
          if (issue.validation === "email") {
            message = "البريد الإلكتروني غير صالح";
          } else if (issue.validation === "url") {
            message = "الرابط غير صالح";
          }
          break;
      }
    } else {
      // English messages
      switch (issue.code) {
        case "invalid_type":
          if (issue.received === "undefined" || issue.received === "null") {
            message = "This field is required";
          }
          break;
        case "too_small":
          if (issue.type === "string") {
            if (issue.minimum === 1) message = "This field is required";
            else message = `Must be at least ${issue.minimum} characters`;
          }
          break;
      }
    }

    return { message };
  };
};

export default function ClientProviders({ children, locale, messages }: Props) {
  useEffect(() => {
    z.setErrorMap(customErrorMap(locale));
  }, [locale]);

  return (
    <NextIntlClientProvider
      locale={locale}
      messages={messages}
      timeZone={process.env.NEXT_PUBLIC_TIMEZONE}
    >
      <Providers>
        <UserProvider>
          <TenantProvider>
            <SearchButtonProvider>
              <SearchProvider>
                <AsideProvider>{children}</AsideProvider>
              </SearchProvider>
            </SearchButtonProvider>
          </TenantProvider>
        </UserProvider>
      </Providers>
    </NextIntlClientProvider>
  );
}

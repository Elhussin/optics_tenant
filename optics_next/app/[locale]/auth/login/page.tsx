"use client";

import LoginForm from "@/components/forms/LoginForm";
// import {getTranslations} from 'next-intl/server';
import { useTranslations } from "next-intl";
// import { Metadata } from 'next';
// import { generateMetadata } from '@/lib/utils/metadata';
// import { useParams } from 'next/navigation';

// export const metadata: Metadata = generateMetadata({
//   title: 'Login',
//   description: 'Login to O-S-M',
//   keywords: ['optical', 'system', 'management', 'O-S-M'],
//   openGraphType: 'website',
//   twitterCardType: 'summary',
// });

// export default async function LoginPage({params}: {params: {locale: string}}) {
//   const {locale} = await params;
//   const t = await getTranslations({locale, namespace: 'login'});
//   return (
//       <LoginForm
//       alias="users_login_create"
//       className="container"
//       title={t('title')}
//       message={t('message')}
//       submitText={t('button')}
//        />
//   );
// }

export default function LoginPage() {
  // const proms= useParams()
  // const locale =proms.locale as string
  const t = useTranslations("login");
  return (
    <LoginForm
      alias="users_login_create"
      className="container"
      title={t("title")}
      message={t("message")}
      submitText={t("button")}
    />
  );
}

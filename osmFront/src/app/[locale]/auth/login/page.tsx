"use client";

import LoginForm from "@/src/features/auth/components/LoginForm";
import { useTranslations } from "next-intl";
import { formsConfig } from "@/src/shared/constants/formsConfig";
export default function LoginPage() {
  const t = useTranslations("login");
  return (
    <LoginForm
      alias={formsConfig.login.createAlias!}
      className="container"
      title={t("title")}
      message={t("message")}
      submitText={t("button")}
    />
  );
}

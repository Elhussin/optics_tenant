"use client";

import LoginForm from "@/src/features/auth/components/LoginForm";
import { useTranslations } from "next-intl";
import { featuresConfig } from "@/src/shared/constants/entityConfig";
export default function LoginPage() {
  const t = useTranslations("login");
  return (
    <LoginForm
      alias={featuresConfig.login.createAlias!}
      className="container"
      title={t("title")}
      message={t("message")}
      submitText={t("button")}
    />
  );
}

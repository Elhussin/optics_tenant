"use client";

import LoginForm from "@/components/forms/LoginForm";
import { useTranslations } from "next-intl";
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

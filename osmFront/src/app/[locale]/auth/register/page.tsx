"use client";
import LoginForm from "@/src/features/auth/components/LoginForm";
import { getSubdomain } from "@/src/shared/utils/getSubdomain";
import { useTranslations } from "next-intl";
import { formRequestProps } from "@/src/shared/types";
import { featuresConfig } from "@/src/shared/constants/entityConfig";

export default function RegisterPage() {
  const t = useTranslations("register");
  const t2 = useTranslations("tenants");
  const subdomain = getSubdomain();

  const props: formRequestProps = {
    alias: featuresConfig["register-users"].createAlias!,
    submitText: t("button"),
    mode: "create",
    title: t("title"),
    message: t("message"),
    istenant: false,
  };

  if (!subdomain) {
    props.alias = featuresConfig["register-tenants"].createAlias!;
    props.message = t2("message");
    props.istenant = true;
    props.title = t2("title");
    props.submitText = t2("button");
  }

  return (
    <LoginForm
      istenant={props.istenant}
      alias={props.alias}
      submitText={props.submitText}
      mode="create"
      title={props.title}
      message={props.message}
    />
  );
}

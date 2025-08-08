"use client";

import { useTranslations } from "next-intl";

export default function CareersPage() {
  const t = useTranslations("careers");

  return (
    <div className="max-w-3xl mx-auto mt-10 p-6 bg-white dark:bg-gray-900 rounded-xl shadow space-y-6">
      <h1 className="text-2xl font-bold">{t("title")}</h1>
      <p>{t("description")}</p>

      <h2 className="text-xl font-semibold">{t("section1.title")}</h2>
      <p>{t("section1.content")}</p>

      <h2 className="text-xl font-semibold">{t("section2.title")}</h2>
      <p>{t("section2.content")}</p>
    </div>
  );
}

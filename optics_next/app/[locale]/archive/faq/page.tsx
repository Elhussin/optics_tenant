"use client";

import { useTranslations } from "next-intl";

export default function FAQPage() {
  const t = useTranslations("faq");

  return (
    <div className="max-w-3xl mx-auto mt-10 p-6 bg-white dark:bg-gray-900 rounded-xl shadow space-y-6">
      <h1 className="text-2xl font-bold">{t("title")}</h1>

      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i}>
            <h2 className="text-lg font-semibold">{t(`q${i}.question`)}</h2>
            <p>{t(`q${i}.answer`)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}


// app/components/FeaturesSection.tsx
"use client";

import { useTranslations } from "next-intl";

export default function FeaturesSection() {
  const t = useTranslations("featuresSection");
  const features = t.raw("list") as Record<string, string>;

  return (
    <section className="py-16 bg-white dark:bg-gray-800">
      <div className="max-w-5xl mx-auto px-6 text-center">
        <h2 className="text-3xl font-semibold mb-10">{t("title")}</h2>
        <ul className="space-y-4 text-lg text-gray-700 dark:text-gray-300 max-w-md mx-auto">
        {Object.entries(features).map(([key, feature]) => (
            <li key={key} className="before:content-['✓'] before:text-primary before:mr-2">
            {feature}
            </li>
        ))}
        </ul>
      </div>
    </section>
  );
}




// app/components/FeaturesSection.tsx
"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";
export default function FeaturesSection() {
  const t = useTranslations("featuresSection");
  const features = t.raw("list") as Record<string, string>;

  return (
    <section className="flex flex-col lg:flex-row items-center justify-between py-8 bg-surface">
      <div className="max-w-5xl mx-auto px-6 text-start">
        <h2 className="text-3xl font-semibold mb-10">{t("title")}</h2>
        <ul className="space-y-4 text-lg  text-gray-700 dark:text-gray-300 max-w-md mx-auto">
        {Object.entries(features).map(([key, feature]) => (
            <li key={key} className="before:content-['✓'] before:text-primary before:mr-2">
            {feature}
            </li>
        ))}
        </ul>
      </div>
      <div className="flex justify-center p-6">
      <Image src="/media/FeaturesSection.png" alt="FeaturesSection" width={500} height={200} priority={true} />
      </div>


    </section>
  );
}



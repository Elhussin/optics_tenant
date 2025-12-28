// app/components/FeaturesSection.tsx
"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { BarChart3, Users, Store, ShieldCheck, Zap, Globe } from "lucide-react";

export default function FeaturesSection() {
  const t = useTranslations("featuresSection");

  // Use icons mapping
  const icons = [BarChart3, Users, Store, ShieldCheck, Zap, Globe];

  // Try to get raw list, if it fails or structure is different, handle gracefully
  let featuresList: string[] = [];
  try {
    const rawList = t.raw("list");
    if (Array.isArray(rawList)) {
      featuresList = rawList;
    } else if (typeof rawList === 'object') {
      featuresList = Object.values(rawList);
    }
  } catch (e) {
    featuresList = ["Feature 1", "Feature 2", "Feature 3", "Feature 4", "Feature 5", "Feature 6"];
  }

  // Ensure we have at least 6 items for grid
  const displayFeatures = featuresList.slice(0, 6).map((text, i) => ({
    title: text,
    description: t("description"), // Placeholder description as key might just be title
    icon: icons[i % icons.length]
  }));

  return (
    <section id="features" className="py-24 bg-white dark:bg-gray-950 relative overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-primary font-semibold tracking-wider uppercase text-sm">{t("title") || "Features"}</span>
          <h2 className="text-3xl md:text-4xl font-bold mt-2 mb-4 text-gray-900 dark:text-white">{t("subtitle")}</h2>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            {t("subdescription")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {displayFeatures.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="p-8 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 hover:shadow-lg transition-shadow duration-300 group"
            >
              <div className="w-12 h-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <feature.icon size={24} />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">{feature.title}</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

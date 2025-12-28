//  app/home/components/HeroSection.tsx
"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { useLocale } from "next-intl";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle } from "lucide-react";
import Image from "next/image";

export default function HeroSection() {
  const t = useTranslations("heroSection");
  const locale = useLocale();

  return (
    <section className="relative pt-20 pb-32 overflow-hidden bg-body">
      {/* Background decoration */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px] mix-blend-multiply dark:mix-blend-screen opacity-70 animate-blob" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-400/10 rounded-full blur-[100px] mix-blend-multiply dark:mix-blend-screen opacity-70 animate-blob animation-delay-2000" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">

          {/* Text Content */}
          <div className="flex-1 text-center lg:text-start">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 text-primary text-sm font-medium mb-6">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
                {t("newVersion") || "New Version 2.0 Released"}
              </div>

              <h1 className="text-5xl lg:text-6xl font-bold leading-tight mb-6 text-main">
                {t("title")}<span className="text-primary">.</span>
              </h1>

              <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto lg:mx-0">
                {t("description")}
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 mb-10">
                <Link
                  href={`/${locale}/auth/register`}
                  className="w-full sm:w-auto px-8 py-4 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition shadow-lg hover:shadow-xl hover:-translate-y-1 text-center flex items-center justify-center gap-2"
                >
                  {t("cta")}

                  <ArrowRight className={locale === "ar" ? "rotate-180" : ""} size={20} />
                </Link>
                <Link
                  href="#features"
                  className="w-full sm:w-auto px-8 py-4 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition text-center"
                >
                   {t("learnMore") || "Learn More"}
                </Link>
              </div>

              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-x-8 gap-y-4 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-green-500" />
                  <span>{t("noCreditCard") || "No credit card required"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-green-500" />
                  <span>{t("freeTrial") || "30-day free trial"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-green-500" />
                  <span>{t("cancelAnytime") || "Cancel anytime"}</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Hero Image/Visual */}
          <div className="flex-1 w-full max-w-xl lg:max-w-none">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="relative"
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-primary to-blue-400 rounded-2xl blur-2xl opacity-20 transform rotate-3 scale-105" />
              <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden aspect-[4/3] flex items-center justify-center">
                {/* Placeholder for dashboard image */}
                <div className="text-center p-8">
                  <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <div className="w-10 h-10 bg-primary rounded-md shadow-lg" />
                  </div>
                  <p className="text-gray-500 font-medium">{t("dashboardPreview") || "Dashboard Preview"}</p>
                  {/* <p className="text-xs text-gray-400 mt-2">Replace with your app screenshot</p> */}
                  <Image src="/media/FeaturesSection.png" alt="Dashboard Preview" width={500} height={500} />
                </div>
              </div>
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
}

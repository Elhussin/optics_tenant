"use client";
import HeroSection from "@/components/layout/home/HeroSection";
import FeaturesSection from "@/components/layout/home/FeaturesSection";
import PricingSection from "@/components/layout/home/PricingSection";

import { useTranslations } from "next-intl";

export default function HomePage() {


  const t = useTranslations("HomePage");

  return (
    <div className="bg-body text-main">
      <HeroSection />
      <FeaturesSection />
      <PricingSection />
    </div>
  );
}

"use client";
import HeroSection from "@/src/shared/components/layout/home/HeroSection";
import FeaturesSection from "@/src/shared/components/layout/home/FeaturesSection";
import PricingSection from "@/src/shared/components/layout/home/PricingSection";


export default function HomePage() {
  return (
    <div className="bg-body text-main">
      <HeroSection />
      <FeaturesSection />
      <PricingSection />
    </div>
  );
}

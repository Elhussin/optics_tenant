"use client";
import HeroSection from "@/src/features/home/components/HeroSection";
import FeaturesSection from "@/src/features/home/components/FeaturesSection";
import PricingSection from "@/src/features/home/components/PricingSection";


export default function HomePage() {
  return (
    <div className="bg-body text-main">
      <HeroSection />
      <FeaturesSection />
      <PricingSection />
    </div>
  );
}

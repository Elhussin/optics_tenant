"use client";
import HeroSection from "@/components/layout/home/HeroSection";
import FeaturesSection from "@/components/layout/home/FeaturesSection";
import PricingSection from "@/components/layout/home/PricingSection";
import {LoadingSpinner, Loading4, Loading3} from "@/components/ui/loding";


export default function HomePage() {
//  const lod =true
//  if (lod) return <Loading3  />;

  
  return (
    <div className="bg-body text-main">
      <HeroSection />
      <FeaturesSection />
      <PricingSection />
    </div>
  );
}

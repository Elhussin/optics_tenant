import { Suspense } from "react";
import { headers } from "next/headers";
import { Loading } from "@/src/shared/components/ui/Loading";
import { getSubdomain } from "@/src/shared/utils/getSubdomain";
import LoginPage from "@/src/app/[locale]/auth/login/page";
import HeroSection from "@/src/shared/components/layout/home/HeroSection";
import FeaturesSection from "@/src/shared/components/layout/home/FeaturesSection";
import TestimonialsSection from "@/src/shared/components/layout/home/TestimonialsSection";
import PricingSection from "@/src/shared/components/layout/home/PricingSection";
import FAQSection from "@/src/shared/components/layout/home/FAQSection";
import CTASection from "@/src/shared/components/layout/home/CTASection";

export default async function HomePage() {
  const headersList = await headers();
  const host = headersList.get("host") || "";
  const subdomain = getSubdomain(host);

  if (subdomain) {
    return <LoginPage />;
  }

  return (
    <div className="bg-body text-main min-h-screen flex flex-col">
      <Suspense fallback={<Loading />}>
        <HeroSection />
        <FeaturesSection />
        <TestimonialsSection />
        <PricingSection />
        <FAQSection />
        <CTASection />
      </Suspense>
    </div>
  );
}

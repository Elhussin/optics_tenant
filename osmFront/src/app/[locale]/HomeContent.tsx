// "use client" – this file runs on the client side
"use client";

import { Suspense } from "react";
import { Loading } from "@/src/shared/components/ui/Loading";
import { useUser } from "@/src/features/auth/hooks/UserContext";
import LoginPage from "@/src/app/[locale]/auth/login/page";
import ProfilePage from "@/src/app/[locale]/profile/page";
import HeroSection from "@/src/shared/components/layout/home/HeroSection";
import FeaturesSection from "@/src/shared/components/layout/home/FeaturesSection";
import TestimonialsSection from "@/src/shared/components/layout/home/TestimonialsSection";
import PricingSection from "@/src/shared/components/layout/home/PricingSection";
import FAQSection from "@/src/shared/components/layout/home/FAQSection";
import CTASection from "@/src/shared/components/layout/home/CTASection";

type Props = {
  /** Subdomain string if request came from a tenant, otherwise null */
  subdomain: string | null;
};

export default function HomeContent({ subdomain }: Props) {
  const { user, loading } = useUser();

  // Show a spinner while auth status is being resolved
  // if (loading) {
  //   return <Loading />;
  // }

  // If we are on a tenant sub‑domain, decide between profile or login
  if (subdomain) {
    return user ? <ProfilePage /> : <LoginPage />;
  }

  // Public landing page – keep the premium layout you already have
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

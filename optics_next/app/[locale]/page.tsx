
import { Metadata } from 'next';
import HeroSection from '@/components/layout/home/HeroSection';
import FeaturesSection from '@/components/layout/home/FeaturesSection';
import PricingSection from '@/components/layout/home/PricingSection';
import { getTranslations } from 'next-intl/server';
import PricingPlans from '@/components/PricingPlans';
export const metadata: Metadata = {
  title: 'O-S-M',
  description: 'Opticl Store Management System',
  icons: {
    icon: [
      { media: '(prefers-color-scheme: light)', url: '/media/logo.png' },
      { media: '(prefers-color-scheme: dark)', url: '/media/logo.png' },
    ],
    apple: '/media/logo.png', // For Apple devices
  },
};


export default async function HomePage({params}: {params: {locale: string}}) {
  const {locale} = await params;
  const t = await getTranslations({locale, namespace: 'HomePage'});
  return (
    <div className='bg-body text-main'>
      <HeroSection />
      <FeaturesSection />
      <PricingSection />
      {/* <PricingPlans /> */}
    </div>
  );
}

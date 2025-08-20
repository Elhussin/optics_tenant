"use client"
import Header from './Header';
import Navbar from './Navbar';
import Footer from './Footer';
import { Toaster } from 'sonner';
import GlobalAlert from '@/components/ui/GlobalAlert';
import { usePathname } from 'next/navigation';
import { useIsIframe } from '@/lib/hooks/useIsIframe';
import Aside  from "@/components/layout/Aside";
import { useAside } from '@/lib/contexts/AsideContext';
import clsx from 'clsx';
import { useLocale } from 'next-intl';
interface Props {
  mainContent?: React.ReactNode;
}

export default function MainLayout({ mainContent }: Props) {

  const pathname = usePathname();
  const excluded = ['/auth/login', '/auth/register'];

  const showAside = !excluded.includes(pathname);
  const isIframe = useIsIframe();
  const { isVisible } = useAside();

  const locale = useLocale(); 
  const isRTL = locale === 'ar';
  return (
<div className="flex flex-col min-h-screen pt-[150px]">
  {!isIframe && (
    <div className="fixed top-0 left-0 w-full z-30 bg-white dark:bg-surface shadow-md">
      <Header />
      <Navbar />
    </div>
  )}

{/*   <div className={clsx("flex flex-1 min-h-0", isVisible ? "md:ml-80" : "md:ml-0", isVisible&&isRTL ? "md:mr-80" : "md:mr-0")}>
 */}

  <div className={clsx("flex flex-1 min-h-0")}>
    {showAside && <Aside />} 

    <main className="main">
      <div className="">
        <GlobalAlert />
        {mainContent}
        <Toaster />
      </div>
    </main>
  </div>

  {!isIframe && <Footer />}
</div>

  );
}
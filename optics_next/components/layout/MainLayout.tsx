"use client"
import Header from './Header';
import Navbar from './Navbar';
import Footer from './Footer';
import { Toaster } from 'sonner';
import GlobalAlert from '@/components/ui/GlobalAlert';
import { usePathname } from 'next/navigation';
import { useIsIframe } from '@/lib/hooks/useIsIframe';
import Aside  from "@/components/layout/Aside";
import { useAside } from '@/lib/context/AsideContext'; // ✅ أضف هذا
import { cn } from '@/lib/utils/cn';
interface Props {
  mainContent?: React.ReactNode;
}

export default function MainLayout({ mainContent }: Props) {

  const pathname = usePathname();
  const excluded = ['/auth/login', '/auth/register'];

  const showAside = !excluded.includes(pathname);
  const isIframe = useIsIframe();
  const { isVisible } = useAside();


  return (
<div className="flex flex-col min-h-screen pt-[120px]">
  {/* Fixed Header + Navbar */}
  <div className="fixed top-0 left-0 w-full z-30 bg-white dark:bg-surface shadow-md">
    <Header />
    <Navbar />
  </div>



  <div className={cn("flex flex-1 min-h-0", isVisible ? "md:ml-80" : "md:ml-0")}>
    {showAside && <Aside />} {/* يظهر فقط عند md وأكبر */}

    <main className="main">
      <div className="">
        <GlobalAlert />
        {mainContent}
        <Toaster />
      </div>
    </main>
  </div>

  <Footer />
</div>

  );
}


// <div className="flex flex-1 flex-col md:flex-row min-h-0">
   
// {showAside && (<div className=""><Aside /></div> )}


// <main
//     className={cn(
//       "p-4 flex-1 w-full overflow-y-auto transition-all duration-500",
//       isVisible ? "md:ml-80" : "md:ml-0"
//     )}
//   >
//   <div className="max-w-6xl mx-auto">
//     <GlobalAlert />
//     {mainContent}
//     <Toaster />
//   </div>
// </main>

// </div>
// src/components/layout/MainLayout.tsx
import Header from './Header';
import Navbar from './Navbar';
import Footer from './Footer';
import { Toaster } from 'sonner';
import GlobalAlert from '@/components/ui/GlobalAlert';
import { usePathname } from 'next/navigation';
import { useIsIframe } from '@/lib/hooks/useIsIframe'; // حسب مكان الهوك
interface Props {
  mainContent?: React.ReactNode; // المحتوى الرئيسي
  asideContent?: React.ReactNode; // المحتوى الخاص بـ Asaide
}

export default function MainLayout({ mainContent, asideContent }: Props) {
 
  const pathname = usePathname();
  const excluded = ['/auth/login', '/auth/register'];

  const showAside = !excluded.includes(pathname);
  const isIframe = useIsIframe();


  
  return (
    <div className="min-h-screen flex flex-col dark:bg-gray-800 dark:text-white">
      {!isIframe && (
      <>
      <Header />
      <Navbar />
      </>
      )}
      
      <div className="flex flex-1 min-h-screen">
      {/* Aside */}
      {!isIframe && (
      <>
      {asideContent && showAside && (
        <aside >
          {asideContent}
        </aside>
      )}
      </>
      )}
      

      {/* Main */}
      <main className="flex-1 p-4">
        <div className="max-w-6xl mx-auto">
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

// src/components/layout/MainLayout.tsx
import Header from './Header';
import Navbar from './Navbar';
import Footer from './Footer';
import { Toaster } from 'sonner';
import GlobalAlert from '@/components/GlobalAlert';
import { usePathname } from 'next/navigation';
interface Props {
  mainContent?: React.ReactNode; // المحتوى الرئيسي
  asideContent?: React.ReactNode; // المحتوى الخاص بـ Asaide
}

export default function MainLayout({ mainContent, asideContent }: Props) {
 
  const pathname = usePathname();
  const excluded = ['/auth/login', '/auth/register'];

  const showAside = !excluded.includes(pathname);


  
  return (
    <div className="min-h-screen flex flex-col dark:bg-gray-800 dark:text-white">
      <Header />
      <Navbar />

      <div className={`flex flex-col lg:flex-row flex-1 ${showAside ? '' : 'justify-center'}`}>
        {/* Asaide */}
        {asideContent && showAside && (
          <aside className="aside">
            {asideContent}
          </aside>
        )}

        {/* Main */}
        <main
          className={`flex justify-center w-full ${
            asideContent ? 'lg:w-3/4' : ''
          } p-4`}
        >
          <div className="w-full lg:w-5/6 ">
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

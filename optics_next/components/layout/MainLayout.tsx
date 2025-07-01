// src/components/layout/MainLayout.tsx
import Header from './Header';
import Navbar from './Navbar';
import Footer from './Footer';
import { Toaster } from 'sonner';
import GlobalAlert from '@/components/GlobalAlert';

interface Props {
  children: React.ReactNode;
}

export default function MainLayout({ children }: Props) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-6">
      <GlobalAlert />
        {children}

        <Toaster />
      </main>
      <Footer />
    </div>
  );
}

'use client';
import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { getSubdomain } from '@/lib/utils/getSubdomain';
import { Link } from '@/app/i18n/navigation';
import DesktopNavLinks from './DesktopNavLinks';
import MobileNavMenu from './MobileNavMenu';
import { AsideButton } from "@/components/ui/buttons/AsideButton";  

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [subdomain, setSubdomain] = useState<string | null>(null);

  useEffect(() => {
    setSubdomain(getSubdomain());
  }, []);

  return (
    <nav className="nav">
      <div className="flex items-center gap-4">
        <AsideButton />
        <Link href="/" className="font-bold text-xl text-gray-800 dark:text-white">O S M</Link>

      </div>

      <DesktopNavLinks subdomain={subdomain} />

      <div className="md:hidden">
        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-700 dark:text-white">
          {isMenuOpen ? <X size={24} /> :"Menu"}
        </button>
      </div>

      <MobileNavMenu isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} subdomain={subdomain} />
    </nav>
  );
}

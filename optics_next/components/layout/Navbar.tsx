'use client';
import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { getSubdomain } from '@/utils/getSubdomain';
import DesktopNavLinks from './DesktopNavLinks';
import MobileNavMenu from './MobileNavMenu';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [subdomain, setSubdomain] = useState<string | null>(null);

  useEffect(() => {
    setSubdomain(getSubdomain());
  }, []);

  return (
    <nav className="nav">
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

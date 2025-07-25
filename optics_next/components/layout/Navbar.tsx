// 'use client';

// import {Link} from '@/app/i18n/navigation';
// import { useEffect, useState } from 'react';
// import { useUser } from '@/lib/context/userContext';

// import LogoutButton from '../ui/buttons/logout';
// import ThemeToggle from '../ui/ThemeToggle';
// import { Menu, X } from 'lucide-react';
// import { getSubdomain } from '@/lib/utils/getSubdomain';
// import LanguageToggle from '../ui/LanguageToggle';
// import { useTranslations } from 'next-intl';

// export default function Navbar() {
//   const [isMenuOpen, setIsMenuOpen] = useState(false);
//   const [subdomain, setSubdomain] = useState<string | null>(null);

//   const { user, loading, logout } = useUser();
//   const t = useTranslations('navBar');
//   useEffect(() => {
//     setSubdomain(getSubdomain());
//   }, []);

//     if(loading){
//       return null
//     }

//   return (
//     <nav dir='ltr' className="nav">
//       {/* Logo + Aside Button */}
//       <div className="flex items-center gap-4">

//         <Link href="/" className="font-bold text-xl text-gray-800 dark:text-white">O S M</Link>
//       </div>

//       {/* Desktop Links */}
//       <div className="hidden md:flex gap-4 items-center">
//         <Link href="/" className="nav-link">{t('home')}</Link>

//         {user ? (
//           <>
//             {user.role === 'ADMIN' && <Link href="/admin" className="nav-link">{t('admin')}</Link>}
//             {user.role === 'TECHNICIAN' && <Link href="/prescriptions" className="nav-link">{t('technician')}</Link>}
//             <Link href="/profile" className="nav-link">{t('profile')}</Link>
//             <LogoutButton logout={logout} />
//             <ThemeToggle />
//             <LanguageToggle />
//           </>
//         ) : (
//           <>
//             {subdomain && <Link href="/auth/login" className="nav-link">{t('login')}</Link>}
//             <Link href="/auth/register" className="nav-link">{t('register')}</Link>
//             <ThemeToggle />
//             <LanguageToggle />
//           </>
//         )}
//       </div>

//       {/* Mobile Menu Toggle Button */}
//       <div className="md:hidden">
//         <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-700 dark:text-white">
//           {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
//         </button>
//       </div>

//       {/* Mobile Drawer Menu */}
//       {isMenuOpen && (
//         <div className="absolute top-full left-0 w-full shadow-md flex flex-col gap-4 p-4 md:hidden z-50 ">
//           <Link href="/" onClick={() => setIsMenuOpen(false)} className="nav-link">{t('home')}</Link>

//           {user ? (
//             <>
//               {user.role === 'ADMIN' && <Link href="/admin" onClick={() => setIsMenuOpen(false)} className="nav-link">{t('admin')}</Link>}
//               {user.role === 'TECHNICIAN' && <Link href="/prescriptions" onClick={() => setIsMenuOpen(false)} className="nav-link">{t('technician')}</Link>}
//               <Link href="/profile" onClick={() => setIsMenuOpen(false)} className="nav-link">{t('profile')}</Link>

//               <div className="flex items-center gap-2">
//                 <LogoutButton logout={() => { setIsMenuOpen(false); logout(); }} />
//                 <ThemeToggle />
//                 <LanguageToggle />
//               </div>
//             </>
//           ) : (
//             <>
//               {subdomain && <Link href="/auth/login" onClick={() => setIsMenuOpen(false)} className="nav-link">{t('login')}</Link>}
//               <Link href="/auth/register" onClick={() => setIsMenuOpen(false)} className="nav-link">{t('register')}</Link>

//               <div className="flex items-center gap-2">
//                 <ThemeToggle />
//                 <LanguageToggle />
//               </div>
//             </>
//           )}
//         </div>
//       )}
//     </nav>
//   );
// }


'use client';
import { useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';
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
        <Link href="/" className="font-bold text-xl text-gray-800 dark:text-white">O S M</Link>
        <AsideButton />
      </div>

      <DesktopNavLinks subdomain={subdomain} />

      <div className="md:hidden">
        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-700 dark:text-white">
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <MobileNavMenu isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} subdomain={subdomain} />
    </nav>
  );
}

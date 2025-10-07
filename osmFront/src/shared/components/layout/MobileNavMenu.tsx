'use client';
import { Link } from '@/src/app/i18n/navigation';
import { useUser } from '@/src/features/auth/hooks/UserContext';
import LogoutButton from '../ui/buttons/logout';
import { useTranslations } from 'next-intl';
import { useSearch } from "@/src/shared/contexts/SearchContext";
import { ActionButton } from "../ui/buttons";
import { Search, X } from "lucide-react";
export default function MobileNavMenu({ isMenuOpen, setIsMenuOpen, subdomain }: {
  isMenuOpen: boolean,
  setIsMenuOpen: (val: boolean) => void,
  subdomain: string | null
}) {
  const { user, logout } = useUser();
  const { toggleSearch, isSearchVisible } = useSearch();
  const t = useTranslations('navBar');

  if (!isMenuOpen) return null;

  return (
    <div className="absolute top-full left-0 w-full shadow-md flex flex-col gap-4 p-4 md:hidden z-50 bg-white dark:bg-gray-900">
      <Link href="/" onClick={() => setIsMenuOpen(false)} className="nav-link">{t('home')}</Link>

      {user ? (
        <>
          {user.role === 'ADMIN' && <Link href="/admin" onClick={() => setIsMenuOpen(false)} className="nav-link">{t('admin')}</Link>}
          {user.role === 'TECHNICIAN' && <Link href="/prescriptions" onClick={() => setIsMenuOpen(false)} className="nav-link">{t('technician')}</Link>}
          <Link href="/profile" onClick={() => setIsMenuOpen(false)} className="nav-link">{t('profile')}</Link>
          <div className="flex items-center gap-2">
            <ActionButton
          label={isSearchVisible ? t('closeSearch') : t('search')}
          onClick={toggleSearch} 
          type="button"
          variant="link"
          className="ml-2 col-span-full"
          icon={isSearchVisible ? <X /> : <Search />}
          title={isSearchVisible ? t('closeSearch') : t('search')}
          
        />
            <LogoutButton logout={() => { setIsMenuOpen(false); logout(); }} />
          </div>
        </>
      ) : (
        <>
          {subdomain && <Link href="/auth/login" onClick={() => setIsMenuOpen(false)} className="nav-link">{t('login')}</Link>}
          <Link href="/auth/register" onClick={() => setIsMenuOpen(false)} className="nav-link">{t('register')}</Link>
          <div className="flex items-center gap-2">
          </div>
        </>
      )}
    </div>
  );
}

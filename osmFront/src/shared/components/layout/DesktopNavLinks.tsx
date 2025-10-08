'use client';
import { Link } from '@/src/app/i18n/navigation';
import { useUser } from '@/src/features/auth/hooks/UserContext';
import LogoutButton from '../ui/buttons/logout';
import { useTranslations } from 'next-intl';
import { useSearch } from "@/src/shared/contexts/SearchContext";
import { Search, X } from "lucide-react";
import { ActionButton } from "../ui/buttons";
import { useSearchButton } from "@/src/shared/contexts/SearchButtonContext";

export default function DesktopNavLinks({ subdomain }: { subdomain: string | null }) {
  const { user, logout } = useUser();
  const t = useTranslations('navBar');
  const { toggleSearch, isSearchVisible } = useSearch();
  const { isVisible } = useSearchButton();

  return (
    <div className="hidden md:flex gap-4 items-center justify-between w-full">
      {/* الجزء الأول: روابط التنقل */}
      <div className="flex gap-4 items-center">
        <Link href="/" className="nav-link">{t('home')}</Link>
        {user && user.role === 'ADMIN' && <Link href="/admin" className="nav-link">{t('admin')}</Link>}
        {user && user.role === 'TECHNICIAN' && <Link href="/prescriptions" className="nav-link">{t('technician')}</Link>}
        {user && <Link href="/profile" className="nav-link">{t('profile')}</Link>}
      </div>
  
      {/* الجزء الثاني: أزرار البحث وتسجيل الدخول/الخروج */}
      <div className="flex gap-2 items-center">
        {user ? (
          <>
            {isVisible && (
              <ActionButton
                // label={isSearchVisible ? t('closeSearch') : t('search')}
                onClick={toggleSearch}
                type="button"
                variant="link"
                className="ml-2 col-span-full"
                icon={isSearchVisible ? <X className="text-red-500" /> : <Search />}
                title={isSearchVisible ? t('closeSearch') : t('search')}
              />
            )}
            <LogoutButton logout={logout} />
          </>
        ) : (
          <>
            <Link href="/auth/login" className="nav-link">{t('login')}</Link>
            <Link href="/auth/register" className="nav-link">{t('register')}</Link>
          </>
        )}
      </div>
    </div>
  );
  

}

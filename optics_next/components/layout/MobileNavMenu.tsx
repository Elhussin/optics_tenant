'use client';
import { Link } from '@/app/i18n/navigation';
import { useUser } from '@/lib/contexts/userContext';
import LogoutButton from '../ui/buttons/logout';
import { useTranslations } from 'next-intl';

export default function MobileNavMenu({ isMenuOpen, setIsMenuOpen, subdomain }: {
  isMenuOpen: boolean,
  setIsMenuOpen: (val: boolean) => void,
  subdomain: string | null
}) {
  const { user, logout } = useUser();
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

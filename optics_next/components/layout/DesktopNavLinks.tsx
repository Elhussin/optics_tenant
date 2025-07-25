'use client';
import { Link } from '@/app/i18n/navigation';
import { useUser } from '@/lib/context/userContext';
import LogoutButton from '../ui/buttons/logout';
import { useTranslations } from 'next-intl';

export default function DesktopNavLinks({ subdomain }: { subdomain: string | null }) {
  const { user, logout } = useUser();
  const t = useTranslations('navBar');

  return (
    <div className="hidden md:flex gap-4 items-center">
      <Link href="/" className="nav-link">{t('home')}</Link>

      {user ? (
        <>
          {user.role === 'ADMIN' && <Link href="/admin" className="nav-link">{t('admin')}</Link>}
          {user.role === 'TECHNICIAN' && <Link href="/prescriptions" className="nav-link">{t('technician')}</Link>}
          <Link href="/profile" className="nav-link">{t('profile')}</Link>
          <LogoutButton logout={logout} />

        </>
      ) : (
        <>
          {subdomain && <Link href="/auth/login" className="nav-link">{t('login')}</Link>}
          <Link href="/auth/register" className="nav-link">{t('register')}</Link>
        </>
      )}
    </div>
  );
}

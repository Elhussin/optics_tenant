// src/components/layout/Header.tsx
import ThemeToggle from '../ui/ThemeToggle';
import LocaleSwitcher from '../ui/LocaleSwitcher';
import Image from 'next/image';
import { Link } from '@/app/i18n/navigation';
import { AsideButton } from "@/components/ui/buttons/AsideButton";
export default function Header() {
  return (


    <header className="header" dir="ltr">
  <div className="w-full flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
    
    <div className="flex justify-center sm:justify-start">
      <Link href="/" className="p-0">
        <Image
          className="border rounded-full bg-amber-200"
          src="/media/logo-1.png"
          alt="logo"
          width={60}
          height={60}
          priority={true}
          title="O-S-M Optics Store Management"
        />
      </Link>
    </div>

    <div className="flex items-center justify-center sm:justify-start gap-2">
      <LocaleSwitcher />
      <ThemeToggle />
      <AsideButton />
    </div>
  </div>
</header>

  );
}

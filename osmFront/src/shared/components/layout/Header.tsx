// src/components/layout/Header.tsx
import ThemeToggle from "../ui/ThemeToggle";
import LocaleSwitcher from "../ui/LocaleSwitcher";
import Image from "next/image";
import { Link } from "@/src/app/i18n/navigation";
import { AsideButton } from "@/src/shared/components/ui/buttons/AsideButton";
export default function Header() {
  return (
    <header className="header" dir="ltr">
      <div className="w-full flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="flex justify-center sm:justify-start">
          <Link href="/" className="p-0">
            <Image
              className="rounded-full bg-amber-200 border-2"
              src="/media/logo.png"
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

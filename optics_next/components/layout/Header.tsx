// src/components/layout/Header.tsx
import ThemeToggle from '../ui/ThemeToggle';
import LanguageToggle from '../ui/LanguageToggle';
import LocaleSwitcher from '../ui/LocaleSwitcher';
export default function Header() {
  return (
    <header className="header ">
      <div className="container">
        <h1 className="title">Solo Vizion</h1>

      </div>
      <div className="flex items-center gap-2">

      {/* <LanguageToggle /> */}
      <LocaleSwitcher />
      <ThemeToggle />

      </div>
    </header>
  );
}

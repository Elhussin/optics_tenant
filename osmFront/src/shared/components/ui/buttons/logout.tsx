"use client";
import { ActionButton } from ".";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import { LogOut } from "lucide-react";
export default function LogoutButton({ logout }: { logout: () => void }) {
  const t = useTranslations("userContext");
  const locale = useLocale() || "en";
  return (
    <button
      onClick={logout}
      title={t("title")}
      className="text-secondary hover:text-red-500 transition-colors duration-200 ease-in-out cursor-pointer"
    >
      <LogOut
        className={`
          ${locale === "ar" ? "rotate-180" : ""}
          transition-transform duration-200 ease-out
        `}
        size={20}
      />
    </button>
  );
}

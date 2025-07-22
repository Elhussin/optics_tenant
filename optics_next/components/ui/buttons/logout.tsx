"use client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {Button} from "./Button";
import { useTranslations } from 'next-intl';

export default function LogoutButton({logout}: {logout: () => void}) {
  const router = useRouter();
  const t = useTranslations('logout');

  const handleLogout = async () => {
    try {
      logout();
      router.push("/auth/login");
    } catch (error) {
      toast.error(t('error'));
      console.log(error);
    }
  };

  return (
    <>
    <Button
      label={t('title')}
      onClick={handleLogout}
      variant="danger"
      title={t('title')}
    />
  </>
  ); 
}

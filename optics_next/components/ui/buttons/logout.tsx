"use client";
import {Button} from "./Button";
import { useTranslations } from 'next-intl';
export default function LogoutButton({logout}: {logout: () => void}) {

  const t = useTranslations('userContext');
  return (
    <>
    <Button
      label={t('title')}
      onClick={logout}
      variant="danger"
      title={t('title')}
    />
  </>
  ); 
}

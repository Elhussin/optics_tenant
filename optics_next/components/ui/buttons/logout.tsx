"use client";
import {ActionButton} from "./";
import { useTranslations } from 'next-intl';
export default function LogoutButton({logout}: {logout: () => void}) {

  const t = useTranslations('userContext');
  return (
    <>
    <ActionButton
      label={t('title')}
      onClick={logout}
      variant="danger"
      title={t('title')}
    />
  </>
  ); 
}

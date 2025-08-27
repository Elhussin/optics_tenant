'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useFormRequest } from '../hooks/useFormRequest';
import { safeToast } from '@/lib/utils/toastService';
import { useRouter } from '@/app/i18n/navigation';
import { useTranslations } from 'next-intl';
import { UserContextType } from '@/types';

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const t = useTranslations('userContext');

  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  // ✅ طلب بيانات المستخدم
  const fetchUser = useFormRequest({
    alias: "users_profile_retrieve",
    onSuccess: (res) => {
      setUser(res);
      setLoading(false);
    },
    onError: () => {
      setUser(null);
      safeToast(t('fetchError'), { type: "error" });
      setLoading(false);
      router.replace(`/auth/login`);
    },
  });

  // ✅ تسجيل خروج
  const logoutRequest = useFormRequest({
    alias: "users_logout_create",
    onSuccess: () => {
      setUser(null);
      router.replace(`/auth/login`);
      safeToast(t('logoutSuccess'), { type: "success" });
    },
    onError: () => {
      safeToast(t('logoutError'), { type: "error" });
    },
  });

  const logout = async () => {
    try {
      await logoutRequest.submitForm();
    } catch (err) {
      safeToast(t('error'), { type: "error" });
    }
  };

  // ✅ جلب بيانات المستخدم عند أول تحميل
  useEffect(() => {
    fetchUser.submitForm();
  }, [fetchUser]);

  const value: UserContextType = {
    user,
    setUser,
    loading,
    fetchUser,
    logout,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

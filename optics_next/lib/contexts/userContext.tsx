'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { useFormRequest } from '../hooks/useFormRequest';
import { safeToast } from '@/lib/utils/toastService';
import { useRouter } from '@/app/i18n/navigation';
import { useTranslations } from 'next-intl';
import { UserContextType, User } from '@/types';

const UserContext = createContext<UserContextType | undefined>(undefined);


export function UserProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const t = useTranslations('userContext');

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // ✅ طلب بيانات المستخدم
  const fetchUser = useFormRequest({
    alias: "users_profile_retrieve",
    onSuccess: (res: User) => {
      setUser(res);
      setLoading(false);
    },
    onError: () => {
      setUser(null);
      setLoading(false);
  
    },
  });


  useEffect(() => {
    fetchUser.submitForm();
  }, []);


  const logoutRequest = useFormRequest({
    alias: "users_logout_create",
    onSuccess: () => {
      setUser(null);
      router.replace(`/auth/login`);
      safeToast(t('logoutSuccess'), { type: "success" });
    },
  });



  const logout = async () => {
    try {
      await logoutRequest.submitForm();
    } catch {
      safeToast(t('logoutError'), { type: "error" });
    }
  };

  const value: UserContextType = useMemo(() => ({
    user,
    setUser,
    loading,
    refetchUser: () => fetchUser.submitForm(),
    logout,
  }), [user, loading]);

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { UserContextType } from '@/types';
import { useFormRequest } from '../hooks/useFormRequest';
import { getSubdomain } from '@/lib/utils/getSubdomain';
import { safeToast } from '@/lib/utils/toastService';
import {useRouter} from '@/app/i18n/navigation';
import {redirect} from '@/app/i18n/navigation';

const UserContext = createContext<UserContextType | undefined>(undefined);


export function UserProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [subdomain, setSubdomain] = useState<string | null>(null);

  const fetchUser = useFormRequest({ alias: "users_profile_retrieve",
    onSuccess: (res) => {
      setUser(res);
      setLoading(false);
    },
    onError: (err) => {
      safeToast("Failed to fetch Your Data", {type: "error",});
      router.replace(`/${router.locale}/auth/login`);

      setLoading(false);
    },
   });
  const logoutRequest = useFormRequest({ alias: "users_logout_create" });

  const logout = async () => {
    await logoutRequest.submitForm();
    setUser(null);

    router.replace(`/auth/login`);
    safeToast("Logged out successfully", {type: "success",});
    
  };

  useEffect(() => {
    const sub = getSubdomain();
    setSubdomain(sub);
  }, []);

  useEffect(() => {
    if(subdomain){
      fetchUser.submitForm();
    }

  }, [subdomain]);

  useEffect(() => {
    if (!fetchUser.isLoading && !fetchUser.isSubmitting && !fetchUser.data) {
      setLoading(false);
    }
  }, [fetchUser.isLoading, fetchUser.isSubmitting, fetchUser.data]);

  const value: UserContextType = { user, setUser, loading, fetchUser, logout };



  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

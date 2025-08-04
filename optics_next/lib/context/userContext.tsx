'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { UserContextType } from '@/types';
import { useFormRequest } from '../hooks/useFormRequest';
import { getSubdomain } from '@/lib/utils/getSubdomain';
import { safeToast } from '@/lib/utils/toastService';
import { useRouter } from '@/app/i18n/navigation';
import { useTranslations } from 'next-intl';
const UserContext = createContext<UserContextType | undefined>(undefined);
import { FetchData } from '@/lib/api/api';

export function UserProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const t = useTranslations('userContext');
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [subdomain, setSubdomain] = useState<string | null>(null);
  const [isFetched, setIsFetched] = useState(false);

  const fetchUser = useFormRequest({
    alias: "users_profile_retrieve",
    onSuccess: (res) => {
      console.log(res);
      setUser(res);
      setLoading(false);
    },
    onError: () => {
      console.log("error");
      safeToast(t('fetchError'), { type: "error" });
      router.replace(`/auth/login`);
      setLoading(false);
    },
  });

  const logoutRequest = useFormRequest({ alias: "users_logout_create",
    onSuccess: () => {
      setUser(null);
      router.replace(`/auth/login`);
      safeToast(t('success'), { type: "success" });
    },
    onError: () => {
      safeToast(t('error'), { type: "error" });
    },
  });



  const logout = async () => {
    await logoutRequest.submitForm();
  };

  useEffect(() => {
    const sub = getSubdomain();
    setSubdomain(sub);
  }, []);

  useEffect(() => {
    if (!isFetched) {
      fetchUser.submitForm();
      setIsFetched(true);
    }

  }, [isFetched]);

  const value: UserContextType = { user, setUser, loading, fetchUser, logout };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};


// {
//   "id": 2,
//   "username": "admin",
//   "email": "admin@public.com",
//   "first_name": "",
//   "last_name": "",
//   "is_active": true,
//   "is_staff": true,
//   "role": {
//       "id": 1,
//       "name": "ADMIN",
//       "permissions": [
//           {
//               "id": 22,
//               "code": "__all__",
//               "description": "ADMIN"
//           }
//       ]
//   },
//   "is_deleted": false,
//   "deleted_at": null,
//   "phone": null,
//   "client": null
// }
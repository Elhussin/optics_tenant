// 'use client';

// import { createContext, useContext, useState, useEffect } from 'react';
// import { UserContextType } from '@/types';
// import { useFormRequest } from '../hooks/useFormRequest';
// import { getSubdomain } from '@/lib/utils/getSubdomain';
// import { safeToast } from '@/lib/utils/toastService';
// import { useRouter } from '@/app/i18n/navigation';
// import { useTranslations } from 'next-intl';
// const UserContext = createContext<UserContextType | undefined>(undefined);
// import { FetchData } from '@/lib/api/api';

// export function UserProvider({ children }: { children: React.ReactNode }) {
//   const router = useRouter();
//   const t = useTranslations('userContext');
//   const [user, setUser] = useState<any | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [subdomain, setSubdomain] = useState<string | null>(null);
//   const [isFetched, setIsFetched] = useState(false);

//   const fetchUser = useFormRequest({
//     alias: "users_profile_retrieve",
//     onSuccess: (res) => {
//       setUser(res);
//       setLoading(false);
//     },
//     onError: () => {
//       console.log("error");
//       safeToast(t('fetchError'), { type: "error" });
//       router.replace(`/auth/login`);
//       setLoading(false);
//     },
//   });

//   const logoutRequest = useFormRequest({ alias: "users_logout_create",
//     onSuccess: () => {
//       setUser(null);
//       router.replace(`/auth/login`);
//       safeToast(t('success'), { type: "success" });
//     },
//     onError: () => {
//       safeToast(t('error'), { type: "error" });
//     },
//   });



//   const logout = async () => {
//     await logoutRequest.submitForm();
//   };

//   useEffect(() => {
//     const sub = getSubdomain();
//     setSubdomain(sub);
//   }, []);

//   useEffect(() => {
//     if (!isFetched) {
//       fetchUser.submitForm();
//       setIsFetched(true);
//     }

//   }, [isFetched]);

//   const value: UserContextType = { user, setUser, loading, fetchUser, logout };

//   return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
// }

// export const useUser = () => {
//   const context = useContext(UserContext);
//   if (!context) {
//     throw new Error('useUser must be used within a UserProvider');
//   }
//   return context;
// };

// 'use client';

// import { createContext, useContext, useState, useEffect, useCallback } from 'react';
// import { UserContextType } from '@/types';
// import { useFormRequest } from '../hooks/useFormRequest';
// import { getSubdomain } from '@/lib/utils/getSubdomain';
// import { safeToast } from '@/lib/utils/toastService';

// import { useRouter } from '@/app/i18n/navigation';
// import { useTranslations } from 'next-intl';

// const UserContext = createContext<UserContextType | undefined>(undefined);

// export function UserProvider({ children }: { children: React.ReactNode }) {
//   const router = useRouter();
//   const t = useTranslations('userContext');
//   const [user, setUser] = useState<any | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [subdomain, setSubdomain] = useState<string | null>(null);
//   const [isFetched, setIsFetched] = useState(false);

//   const fetchUser = useFormRequest({
//     alias: "users_profile_retrieve",
//     onSuccess: (res) => {
//       setUser(res.data || res);
//       setLoading(false);
//     },
//     onError: (error) => {
//       console.error("User fetch error:", error);
//       setUser(null);
//       setLoading(false);
      
//       // فقط إعادة التوجيه إذا لم يكن هناك مستخدم
//       if (!user) {
//         safeToast(t('fetchError'), { type: "error" });
//         router.push('/auth/login');
//       }
//     },
//   });

//   const logoutRequest = useFormRequest({
//     alias: "users_logout_create",
//     onSuccess: () => {
//       setUser(null);
//       safeToast(t('logoutSuccess'), { type: "success" });
//       router.push('/auth/login');
//     },
//     onError: (error) => {
//       console.error("Logout error:", error);
//       safeToast(t('logoutError'), { type: "error" });
//     },
//   });

//   const logout = useCallback(async () => {
//     await logoutRequest.submitForm();
//   }, [logoutRequest]);

//   // جلب بيانات المستخدم مرة واحدة
//   useEffect(() => {
//     const loadUser = async () => {
//       if (!isFetched) {
//         try {
//           await fetchUser.submitForm();
//           setIsFetched(true);
//         } catch (error) {
//           console.error("Failed to fetch user:", error);
//           setIsFetched(true);
//         }
//       }
//     };

//     loadUser();
//   }, [isFetched, fetchUser]);

//   // جلب النطاق الفرعي
//   useEffect(() => {
//     setSubdomain(getSubdomain());
//   }, []);

//   const value: UserContextType = {
//     user,
//     setUser,
//     loading,
//     fetchUser: fetchUser.submitForm,
//     logout
//   };

//   return (
//     <UserContext.Provider value={value}>
//       {children}
//     </UserContext.Provider>
//   );
// }

// export const useUser = () => {
//   const context = useContext(UserContext);
//   if (!context) {
//     throw new Error('useUser must be used within a UserProvider');
//   }
//   return context;
// };


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
  }, []);

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

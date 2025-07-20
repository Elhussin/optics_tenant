'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { UserContextType } from '@/types';
import { useRouter } from 'next/navigation';
import { useFormRequest } from '../hooks/useFormRequest';
import { toast } from 'sonner';
import { getSubdomain } from '@/lib/utils/getSubdomain';

const UserContext = createContext<UserContextType | undefined>(undefined);

// export function UserProvider({ children }: { children: React.ReactNode }) {
//   const [user, setUser] = useState<any | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [subdomain, setSubdomain] = useState<string | null>(null);

//   const router = useRouter();
//   const fetchUser = useFormRequest({ alias: "users_profile_retrieve" });
//   const logoutRequest = useFormRequest({ alias: "users_logout_create" });

//   const logout = async () => {
//     await logoutRequest.submitForm();
//     setUser(null);
//     router.replace('/auth/login');
//     toast.success("Logged out successfully");
//   };

//   useEffect(() => {
//     const sub = getSubdomain();
//     setSubdomain(sub);
//   }, []);


// useEffect(() => {
//   if (subdomain && !fetchUser.data && !fetchUser.isSubmitting) {
//     fetchUser.submitForm();
//   }
// }, [subdomain]);

// useEffect(() => {
//   if (fetchUser.data) {
//     setUser(fetchUser.data);
//     setLoading(false);
//   }
// }, [fetchUser.data]);

//   const value: UserContextType = { user, setUser, loading, fetchUser, logout };

//   return (
//     <UserContext.Provider value={value}>
//       {children}
//     </UserContext.Provider>
//   );
// }
export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [subdomain, setSubdomain] = useState<string | null>(null);

  const router = useRouter();
  const fetchUser = useFormRequest({ alias: "users_profile_retrieve" });
  const logoutRequest = useFormRequest({ alias: "users_logout_create" });

  const logout = async () => {
    await logoutRequest.submitForm();
    setUser(null);
    router.replace('/auth/login');
    toast.success("Logged out successfully");
  };

  // 1️⃣ تعيين السوب دومين
  useEffect(() => {
    const sub = getSubdomain();
    setSubdomain(sub);
  }, []);

  // 2️⃣ جلب بيانات المستخدم عند توفر subdomain
  useEffect(() => {
    if (subdomain && !fetchUser.data && !fetchUser.isSubmitting) {
      fetchUser.submitForm();
    }
  }, [subdomain]);

  // 3️⃣ تعيين بيانات المستخدم عند النجاح
  useEffect(() => {
    if (fetchUser.data) {
      setUser(fetchUser.data);
      setLoading(false);
    }
  }, [fetchUser.data]);

  // 4️⃣ عند فشل الجلب أو الانتهاء دون بيانات، توقف التحميل
  useEffect(() => {
    if (!fetchUser.isLoading && !fetchUser.isSubmitting && !fetchUser.data) {
      setLoading(false);
    }
  }, [fetchUser.isLoading, fetchUser.isSubmitting, fetchUser.data]);

  const value: UserContextType = { user, setUser, loading, fetchUser, logout };

  if (loading) {
    return <div className="text-center py-10 text-gray-500">Loading...</div>; // أو سبينر
  }

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

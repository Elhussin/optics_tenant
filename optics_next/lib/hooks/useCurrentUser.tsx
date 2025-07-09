// lib/hooks/useCurrentUser.tsx
'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { UserContextType } from '@/types';
import { useRouter } from 'next/navigation';
import { useFormRequest } from './useFormRequest';
import { toast } from 'sonner';

const UserContext = createContext<UserContextType | undefined>(undefined);


export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchUser = useFormRequest({
    alias: "users_profile_retrieve",
    onSuccess: (res) => {
      setUser(res);
      setLoading(false);
    },
    onError: (err) => {
      console.log("Fetch user error:", err);
      setUser(null);
      setLoading(false);
    },
  });

  const logoutRequest = useFormRequest({
    alias: "users_logout_create", // تأكد من أن هذا معرف في zodios أو axios config
    onSuccess: () => {
      setUser(null);
      router.replace('/auth/login');
      toast.success("Logged out successfully");
      // setLoading(false);
    },
    onError: (err) => {
      console.error("Logout error:", err);
      setUser(null);
      router.replace('/auth/login');
      // setLoading(false);
    },
  });

  const logout = async () => {
    await logoutRequest.submitForm();
  };

  useEffect(() => {
    if (!user) {
      setLoading(false);
      fetchUser.submitForm();
    }
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser, loading, refreshUser: fetchUser, logout }}>
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

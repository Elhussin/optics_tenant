'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { UserContextType } from '@/types';
import { useRouter } from 'next/navigation';
import { useFormRequest } from '../hooks/useFormRequest';
import { toast } from 'sonner';
import { handleErrorStatus } from '@/lib/utils/error';
import { getSubdomain } from '@/lib/utils/getSubdomain';

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const subdomain = getSubdomain();

  const fetchUser = useFormRequest({
    alias: "users_profile_retrieve",
    onSuccess: (res: any) => {
      setUser(res);
      setLoading(false);
    },
    onError: (err: any) => {
      toast.error(handleErrorStatus(err));
      setUser(null);
      setLoading(false);
    },
  });

  const logoutRequest = useFormRequest({
    alias: "users_logout_create", 
    onSuccess: () => {
      setUser(null);
      router.replace('/auth/login');
      toast.success("Logged out successfully");
    },
    onError: (err: any) => {
      toast.error(handleErrorStatus(err));
      setUser(null);
      router.replace('/auth/login');
    },
  });

  const logout = async () => {
    await logoutRequest.submitForm();
  };

  useEffect(() => {
    if (!user && subdomain) {
      setLoading(false);
      fetchUser.submitForm();
    }
  }, []);
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

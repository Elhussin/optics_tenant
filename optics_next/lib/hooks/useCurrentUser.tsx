'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import api from '@/lib/api/axios';
import { UserContextType } from '@/types';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useFormRequest } from './useFormRequest';
const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const logout = async () => {
    try {
      await api.post("/api/users/logout/", {});
    } catch (error) {
      console.log(error);
    }
    setUser(null);
    router.push('/auth/login');
  };
  const fetchUser = useFormRequest({ alias: "users_profile_retrieve", onSuccess: (res) => { setUser(res); setLoading(false); }, onError: (err) => { console.log(err); setLoading(false); } });



  useEffect(() => {
    setLoading(true);
    fetchUser.submitForm();
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
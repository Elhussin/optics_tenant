'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import api from '@/lib/api/axios';
import { UserContextType } from '@/types';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
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

  const fetchUser = async () => {
    try {
      await api.post("/api/users/token/refresh/"); 
      const res = await api.get('/api/users/profile/');

      setUser(res);
    } catch (error: any) {
      if (error.response?.status === 401) {
        logout();
        router.push('/auth/login');
        toast.error("Session expired. Please log in again.");
      } else {
        router.push('/auth/login');
        toast.error("Failed to fetch user");
        console.log("error", error);
      }
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
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
'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import api from '@/lib/zod-client/zodios-client';
import { UserContextType } from '@/types';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const logout = async () => {
     
        try {
          await api.post("/api/users/logout/", {});
          useRouter().push("/auth/login");
        } catch (error) {
          console.log(error);
        }
      
    
    setUser(null);
    window.location.href = '/auth/login';
  };

  const fetchUser = async () => {
    try {
      // await api.post("/api/users/token/refresh/"); // سيتم إرسال refreshToken الموجود في HttpOnly Cookie
      const res = await api.get('/api/users/profile/');
      console.log("fetchUser",res);
      setUser(res);
    } catch (error) {
      toast.error("Failed to fetch user");
      console.log("error",error);
      setUser(null);
      throw error; 
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
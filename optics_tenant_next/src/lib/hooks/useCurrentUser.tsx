'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import api from '@/src/lib/zodios-client';

const UserContext = createContext(null);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    try {
      const res = await api.get('/api/users/profile/');
      console.log("res",res)
      setUser(res);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);
  
  return (
    <UserContext.Provider value={{ user, setUser, loading, refreshUser: fetchUser }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext);

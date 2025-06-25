// src/hooks/useCurrentUser.ts
'use client';

import { useEffect, useState } from 'react';
// import axios from 'axios';
import api from '@/src/lib/api';

export function useCurrentUser() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get('/api/users/profile/');
        console.log(res.received);
        setUser(res);
      } catch (error) {
        console.error('Error fetching user:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  return { user, loading };
}

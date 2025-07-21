'use client'
import { useEffect, useState } from 'react';
import { useFormRequest } from '@/lib/hooks/useFormRequest';
// import { useAuth } from '@/lib/hooks/useAuth';

export default function UserProfile() {
    // const { user } = useAuth();
    const fetchUser = useFormRequest({ alias: "users_profile_retrieve", onSuccess: (res) => { setUser(res); }, onError: (err) => { console.log(err); } });
    const [user, setUser] = useState<any>(null);
    
  // جلب البيانات عند تحميل المكون
  useEffect(() => {
    fetchUser.submitForm();
  }, []);


  return (
    <div>
      <h1>Profile</h1>
      <p>{user?.username}</p>
      {fetchUser.isLoading && <p>Loading...</p>}
    </div>
  );
}
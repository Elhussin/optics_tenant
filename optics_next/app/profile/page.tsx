'use client'


import { useEffect } from 'react';
import { useFormRequest } from '@/lib/hooks/useFormRequest';
import { schemas } from '@/lib/zod-client';

// تعريف السكيما
const userSchema = schemas.UserRequest;

export default function UserProfile({ userId }: { userId: string }) {
  const {
    register, handleSubmit,formState: { errors }, submitForm,setValue,isLoading
  } = useFormRequest(userSchema, {mode: 'get', id: userId, apiOptions: {
      endpoint: 'users/users', 
      onSuccess: (data) => {
        console.log('User data loaded:', data);
  
        if (data.success && data.data) {
          Object.entries(data.data).forEach(([key, value]) => {
            setValue(key as any, value);
          });
        }
      },
      onError: (error) => {
        console.error('Failed to load user:', error);
      }
    }
  });

  // جلب البيانات عند تحميل المكون
  useEffect(() => {
    const fetchData = async () => {
      await submitForm({} as any); // إرسال طلب GET (لا حاجة للبيانات في GET)
    };
    fetchData();
  }, [userId]);

  return (
    <form>
      {/* حقول النموذج */}
      <input {...register('username')} />
      {errors.username && <span>{errors.username.message}</span>}
      
      {/* ... بقية الحقول */}
      
      {isLoading && <p>Loading user data...</p>}
    </form>
  );
}
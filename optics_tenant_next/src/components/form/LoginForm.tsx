
'use client';
import { useLoginForm } from '@/src/lib/forms/useLoginForm';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';



export default function LoginPage() {
  const router = useRouter();
  const { register, handleSubmit, formState: { errors }, handleServerErrors } = useLoginForm();

  const onSubmit = async (data: any) => {   
    try {
      // Replace with your actual login API call
      await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      toast.success('تم تسجيل الدخول بنجاح!');
      router.push('/dashboard');
    } catch (e: any) {
      if (e.response?.status === 400) {
        handleServerErrors(e.response.data);
      } else {
        toast.error('حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.');
      }
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow">
      <h1 className="text-xl font-bold mb-6">تسجيل الدخول</h1>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="mb-4">
          <label htmlFor="email" className="block text-sm font-medium mb-1">البريد الإلكتروني</label>
          <input
            id="email"
            type="email"
            {...register('email')}
            className={`w-full p-2 border rounded ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
          />
          {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
        </div>
        <div className="mb-4">
          <label htmlFor="password" className="block text-sm font-medium mb-1">كلمة المرور</label>
          <input
            id="password"
            type="password"
            {...register('password')}
            className={`w-full p-2 border rounded ${errors.password ? 'border-red-500' : 'border-gray-300'}`}
          />
          {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
        </div>
        <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700">
          تسجيل الدخول
        </button>
      </

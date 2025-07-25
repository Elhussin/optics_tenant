'use client';

import { useRouter } from "next/navigation";
import { useUser } from "@/lib/context/userContext";
import { formRequestProps, UseFormRequestReturn } from "@/types";
import { useFormRequest } from "@/lib/hooks/useFormRequest";
import { useEffect, useState } from 'react';
import { Loading4 } from '@/components/ui/loding';
import { cn } from '@/lib/utils/cn';
import { toast } from 'sonner';

export default function LoginForm(props: formRequestProps) {
  const { fetchUser, user, setUser } = useUser();
  const router = useRouter();
  const [redirect, setRedirect] = useState<string | null>(null);

  const { onSuccess,title, message,  submitText = "Login", className, alias, mode = "login", istenant = false } = props;

  const {
    handleSubmit,
    submitForm,
    formErrors,
    errors,
    isSubmitting,
    isLoading,
    register
  }: UseFormRequestReturn = useFormRequest({ alias: alias });

  
  
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setRedirect(params.get("redirect") || "/profile");
  }, []);

  const onSubmit = async (data: any) => {
    const result = await submitForm(data);
    if (result?.success) {
      toast.success(message);

      if (mode === "login") {
        const userResult = await fetchUser.submitForm();
        if (userResult.success) {
          setUser(userResult.data);
          router.replace(redirect || "/profile");
        } else {
          console.error("Failed to fetch user data after login");
        }
      } else if (mode === "create") {
        router.replace('/auth/login');
      }
    }
  };

  useEffect(() => {
    if (user) {
      router.replace('/profile');
    }
  }, [user, router]);

  if (!redirect || user) {
    return <Loading4 />;
  }




  // return (
  //   <div className="flex items-center justify-center ">
  //     <div className="p-4 rounded-md shadow-md bg-info">
  //       <h1 className="text-center mb-4">{title}</h1>

  //       <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
  //         <div>
  //           <label className="label">User Name</label>
  //           {istenant ? (
  //             <>
  //               <input
  //                 {...register("name")}
  //                 className="input-text"
  //                 placeholder="Enter name"
  //               />
  //               {errors.name && <p className="error-text">{errors.name.message as string}</p>}
  //             </>
  //           ) : (
  //             <>
  //               <input
  //                 {...register("username")}
  //                 className="input-text"
  //                 placeholder="Enter username"
  //               />
  //               {errors.username && <p className="error-text">{errors.username.message as string}</p>}
  //             </>
  //           )}
  //         </div>

  //         {mode === "create" && (
  //           <div>
  //             <label className="label">Email</label>
  //             <input
  //               {...register("email")}
  //               className="input-text"
  //               placeholder="Enter email"
  //             />
  //             {errors.email && <p className="error-text">{errors.email.message as string}</p>}
  //           </div>
  //         )}

  //         <div>
  //           <label className="label">Password</label>
  //           <input
  //             {...register("password")}
  //             type="password"
  //             className="input-text"
  //             placeholder="Enter password"
  //           />
  //           {errors.password && <p className="error-text">{errors.password.message as string}</p>}
  //         </div>

  //         {errors.root && (
  //           <p className="error-text">{errors.root.message as string}</p>
  //         )}

  //         <button
  //           type="submit"
  //           disabled={isSubmitting || isLoading}
  //           className="btn btn-primary"
  //         >
  //           {isSubmitting || isLoading ? submitText + "..." : submitText}
  //         </button>
  //       </form>
  //     </div>
  //   </div>
  // )
  return (
  <div className="min-h-screen flex items-center justify-center px-4 py-8 bg">
    <div className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-2 gap-8 bg-white rounded-2xl shadow-xl overflow-hidden">
      {/* الصورة أو النبذة */}
      <div className="hidden md:flex items-center justify-center bg-info p-6">
        {/* يمكنك وضع صورة أو نبذة تعريفية هنا */}
        <div className="text-white text-center space-y-4">
          <img
            src="/auth-illustration.svg" // استبدلها بمسار صورتك أو احذف الصورة وضع نبذة
            alt="Auth illustration"
            className="w-3/4 mx-auto"
          />
          <h2 className="text-2xl font-bold">Welcome to the Portal</h2>
          <p className="text-base">Please fill in the form to continue.</p>
        </div>
      </div>

      {/* نموذج الإدخال */}
      <div className="p-6 md:p-10">
        <h1 className="text-center text-2xl font-semibold mb-6">{title}</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* الاسم أو اسم المستخدم */}
          <div>
            <label className="label">User Name</label>
            {istenant ? (
              <>
                <input
                  {...register("name")}
                  className="input-text"
                  placeholder="Enter name"
                />
                {errors.name && (
                  <p className="error-text">{errors.name.message as string}</p>
                )}
              </>
            ) : (
              <>
                <input
                  {...register("username")}
                  className="input-text"
                  placeholder="Enter username"
                />
                {errors.username && (
                  <p className="error-text">
                    {errors.username.message as string}
                  </p>
                )}
              </>
            )}
          </div>

          {/* البريد الإلكتروني */}
          {mode === "create" && (
            <div>
              <label className="label">Email</label>
              <input
                {...register("email")}
                className="input-text"
                placeholder="Enter email"
              />
              {errors.email && (
                <p className="error-text">{errors.email.message as string}</p>
              )}
            </div>
          )}

          {/* كلمة المرور */}
          <div>
            <label className="label">Password</label>
            <input
              {...register("password")}
              type="password"
              className="input-text"
              placeholder="Enter password"
            />
            {errors.password && (
              <p className="error-text">
                {errors.password.message as string}
              </p>
            )}
          </div>

          {/* رسالة خطأ عامة */}
          {errors.root && (
            <p className="error-text">{errors.root.message as string}</p>
          )}

          {/* زر الإرسال */}
          <button
            type="submit"
            disabled={isSubmitting || isLoading}
            className="btn btn-primary w-full"
          >
            {isSubmitting || isLoading ? submitText + "..." : submitText}
          </button>
        </form>
      </div>
    </div>
  </div>
);

}

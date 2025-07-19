// app/auth/login/LoginRequestForm.tsx
'use client';
import { useRouter,useSearchParams } from "next/navigation";
import { useUser } from "@/lib/context/userContext";
import { useCrudFormRequest } from "@/lib/hooks/useCrudFormRequest";
import { formRequestProps } from "@/types";
import { useEffect } from 'react';
import { Loading4 } from '@/components/ui/loding';

export default function LoginForm(props: formRequestProps) {
  const { fetchUser ,user } = useUser()
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/profile';
  const { onSuccess, submitText = "Login", className, alias,mode="login",istenant=false } = props;

  const { form, onSubmit } = useCrudFormRequest({alias,

    onSuccess: async (res) => { 
      onSuccess?.(res);
      // const redirectFromSession = sessionStorage.getItem('redirect') || '/';

        if (mode === "login") {

          if (fetchUser && typeof fetchUser.submitForm === 'function') {
            await fetchUser.submitForm();
          }
          router.replace(redirect); 
        } else if (mode === "create") {
          router.replace('/auth/login');
        }
      

  }
  });

  useEffect(() => {
    if (user) {
      router.replace('/profile');
    }
  }, [user, router]);

  if (user) {
    return <Loading4 />;
  }

  
  return (
    <div className={className}>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="username" className="label">
            User Name
          </label>
          {istenant && (
            <>
              <input
                {...form.register("name")}
                id="name"
                className="input-text"
                placeholder="Enter name"
                autoComplete="off"
              />
              {form.formState.errors.name && (
                <p className="error-text">
                  {form.formState.errors.name?.message as string}
                </p>
              )}
            </>
          )}
          {!istenant && (
            <>
              <input
                {...form.register("username")}
                id="username"
                className="input-text"
                placeholder="Enter username"
                autoComplete="off"
              />
              {form.formState.errors.username && (
                <p className="error-text">
                  {form.formState.errors.username?.message as string}
                </p>
              )}
            </>
          )}
        </div>
        {mode === "create" && (
        <div>
          <label htmlFor="email" className="label" >
            Email
          </label>
          <input
            {...form.register("email")}
            id="email"
            className="input-text"
            placeholder="Enter email"
            autoComplete="off"
          />
          {form.formState.errors.email && (
            <p className="error-text">
              {form.formState.errors.email?.message as string}
            </p>
          )}
        </div>
        )}

        <div>
          <label htmlFor="password" className="label" >
            Password
          </label>
          <input
            {...form.register("password")}
            id="password"
            type="password"
            className="input-text"
            placeholder="Enter password"
            autoComplete="off"
          />

          {form.formState.errors.password && (
            <p className="error-text">
              {form.formState.errors.password?.message as string}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={form.formState.isSubmitting || form.isLoading}
          className="btn btn-primary"
        >
          
          {form.formState.isSubmitting || form.isLoading
            ? submitText + "..."
            : submitText}
        </button>
      </form>

    </div>
  );
}


      {/* {form.formState.errors.root && (
        <p className="error-text">
          {form.formState.errors.root?.message as string}
        </p>
      )} */}
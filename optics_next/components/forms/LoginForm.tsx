// app/auth/login/LoginRequestForm.tsx
'use client';
import { useRouter } from "next/navigation";
import { useUser } from "@/lib/hooks/useCurrentUser";
import { toast } from "sonner";
import { useCrudFormRequest } from "@/lib/hooks/useCrudFormRequest";
import { formRequestProps } from "@/types";

export default function LoginRequestForm(props: formRequestProps) {
  const { fetchUser } = useUser()
  const router = useRouter();

  const { onSuccess, submitText = "Login", className, alias,mode="login" } = props;

  const { form, onSubmit } = useCrudFormRequest({alias,

    onSuccess: async (res) => { onSuccess?.(res);
      if(mode === "login") {
        router.push("/profile");
      
      if (fetchUser && typeof fetchUser.submitForm === 'function') {
        await fetchUser.submitForm();

    }
    }
  }
  });

  
  return (
    <div className={className}>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="username" className="label">
            User Name
          </label>
          <input
            {...form.register("username")}
            id="username"
            className="input-text"
            placeholder="Enter username"
          />
          {form.formState.errors.username && (
            <p className="error-text">
              {form.formState.errors.username?.message as string}
            </p>
          )}
        </div>

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
      {form.formState.errors.root && (
        <p className="error-text">
          {form.formState.errors.root?.message as string}
        </p>
      )}
    </div>
  );
}

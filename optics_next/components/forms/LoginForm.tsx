// app/auth/login/LoginRequestForm.tsx
'use client';

import { SubmitHandler } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useUser } from "@/lib/hooks/useCurrentUser";
import { useFormRequest } from "@/lib/hooks/useFormRequest";
import { toast } from "sonner";

export default function LoginRequestForm({
  onSuccess,
  submitText = "Login",
  className = "",
}: {
  onSuccess?: () => void;
  submitText?: string;
  className?: string;
}) {
  const { refreshUser } = useUser();
  const router = useRouter();

  const form = useFormRequest({
    alias: "users_login_create",
    onSuccess: async () => {
      toast.success("Login successful");
      await refreshUser.submitForm(); // جلب بيانات المستخدم بعد تسجيل الدخول
      onSuccess?.(); // تشغيل كولباك إضافي إن وُجد
      router.push("/profile");
    },
    onError: (err) => {
      toast.error("Login failed");
      console.error("Login error:", err);
    },
  });

  const onSubmit: SubmitHandler<any> = async (data) => {
    const result = await form.submitForm(data);
    if (!result?.success) {
      console.error("Validation error:", result?.error);
    }
  };
  
  return (
    <div className={className}>

      {form.formState.errors.root && (
        <p className="text-red-500 text-sm mb-2">
          {form.formState.errors.root.message}
        </p>
      )}

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="username" className="block font-medium mb-1">
            Username
          </label>
          <input
            {...form.register("username")}
            id="username"
            className="w-full border p-2 rounded"
            placeholder="Enter username"
          />
          {form.formState.errors.username && (
            <p className="text-red-500 text-sm mt-1">
              {form.formState.errors.username.message}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="password" className="block font-medium mb-1">
            Password
          </label>
          <input
            {...form.register("password")}
            id="password"
            type="password"
            className="w-full border p-2 rounded"
            placeholder="Enter password"
          />
          {form.formState.errors.password && (
            <p className="text-red-500 text-sm mt-1">
              {form.formState.errors.password.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={form.formState.isSubmitting || form.isLoading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {form.formState.isSubmitting || form.isLoading
            ? "Logging in..."
            : submitText}
        </button>
      </form>
    </div>
  );
}

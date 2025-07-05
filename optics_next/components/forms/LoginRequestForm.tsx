// components/forms/LoginRequestForm.tsx
'use client';

import React from "react";
import { z } from "zod";
import { schemas } from "@/lib/api/zodClient";
import { useFormRequest } from "@/lib/hooks/useFormRequest";
import { toast } from "sonner";

const schema = schemas.LoginRequest;

interface LoginFormProps {
  onSuccess?: (res: any) => void;
  submitText?: string;
  className?: string;
}

export default function LoginRequestForm({
  onSuccess,
  submitText = "Login",
  className = "",
}: LoginFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    submitForm,
    isLoading,
    reset,
  } = useFormRequest(schema, {
    alias: "users_login_create", // ✅ تأكد أنها موجودة في Zodios endpoints
    onSuccess: (res) => {
      toast.success("Login successful");
      onSuccess?.(res);
    },
    onError: (error) => {
      toast.error(error?.message || "Login failed");
      
    },
  });

  const onSubmit: SubmitHandler<z.infer<typeof schema>> = async (data: z.infer<typeof schema>) => {
    console.log(data);
    const result = await submitForm(data);
    console.log(result);
    if (result.success) {
      reset();
    }
  };

  return (
    <div className={className}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="username" className="block font-medium mb-1">
            Username
          </label>
          <input
            {...register("username")}
            id="username"
            className="w-full border p-2 rounded"
            placeholder="Enter username"
          />
          {errors.username && (
            <p className="text-red-500 text-sm mt-1">{errors.username.message}</p>
          )}
          {/* {errors.root?.message && (
            <p className="text-red-500 text-sm mt-1">{errors.root.message}</p>
          )} */}
        </div>

        <div>
          <label htmlFor="password" className="block font-medium mb-1">
            Password
          </label>
          <input
            {...register("password")}
            id="password"
            type="password"
            className="w-full border p-2 rounded"
            placeholder="Enter password"
          />
          {errors.password && (
            <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting || isLoading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {isSubmitting || isLoading ? "Logging in..." : submitText}
        </button>
      </form>
    </div>
  );
}

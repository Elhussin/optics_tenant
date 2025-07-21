'use client';
import { useState } from 'react';
import { useFormRequest } from '@/lib/hooks/useFormRequest';

export default function ForgotPasswordPage() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error" | "invalid">("idle");
  const [message, setMessage] = useState<string>("");

  const alias = "users_password_reset_create";

  const formRequest = useFormRequest({
    alias,
    onSuccess: async (res) => {
      setStatus("success");
      setMessage("Password reset link has been sent to your email.");
    },
    onError: async (err) => {
      const detail = err.response?.data?.detail || "Password reset failed. Please try again.";
      setStatus("error");
      setMessage(detail);
    },
  });

  const onSubmit = async (data: any) => {
    if (!data.email) {
      setStatus("invalid");
      setMessage("Email is required.");
      return;
    }
    setStatus("loading");
    setMessage("Resetting your password...");
    formRequest.submitForm({ data });
  };

  return (
    <div>
      <form onSubmit={formRequest.handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="label" htmlFor="email">Email</label>
          <input
            type="email"
            required
            {...formRequest.register("email")}
            className="input-text"
            placeholder="Enter email"
          />
          {formRequest.errors.email && (
            <p className="error-text">{formRequest.errors.email.message as string}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={formRequest.isSubmitting || formRequest.isLoading}
          className="btn btn-primary"
        >
          {formRequest.isSubmitting || formRequest.isLoading ? "Sending Reset Link..." : "Send Reset Link"}
        </button>

        {status !== "idle" && (
          <div className={`status-text ${status}`}>
            {message}
          </div>
        )}
      </form>
    </div>
  );
}

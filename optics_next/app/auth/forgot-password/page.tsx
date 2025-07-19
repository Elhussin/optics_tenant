// app/forgot-password/page.tsx
'use client';
import { useState, useEffect } from 'react';
import { useCrudFormRequest } from '@/lib/hooks/useCrudFormRequest';
import { getSubdomain } from '@/lib/utils/getSubdomain';
// users_password_reset_confirm_create
// users_password_reset_create
export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const tenant = getSubdomain();

  const alias = "users_password_reset_create";
  const [status, setStatus] = useState<"loading" | "success" | "error" | "invalid">(
    "loading"
  );
  const [message, setMessage] = useState<string>("Resetting your password...");

  const { onSubmit } = useCrudFormRequest({
      alias,
      onSuccess: async (res) => {
        console.log(res);
        setStatus("success");
        setMessage(
       "Password reset link has been sent to your email."
        );
      },
      onError: async (err) => {
        const detail = err.response?.data?.detail || "Password reset failed. Please try again.";
        setStatus("error");
        setMessage(detail);
      },
    });
  

    useEffect(() => {
      onSubmit({ email, tenant });
    }, []);


  return (
    <div>
      {submitted ? (
        <p>{message}</p>
      ) : (
        <>
          <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
          <button onClick={onSubmit}>Send Reset Link</button>
        </>
      )}
    </div>
  );
}

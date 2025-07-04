// app/login/page.tsx
'use client';

import LoginRequestForm from "@/components/forms/LoginRequestForm";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  return (
    <div className="max-w-md mx-auto mt-20 p-6 bg-white shadow-md rounded-md">
      <h1 className="text-xl font-semibold text-center mb-6">Login</h1>
      <LoginRequestForm
        onSuccess={() => router.push("/dashboard")}
        submitText="Login"
      />
    </div>
  );
}
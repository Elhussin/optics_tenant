'use client';
import { useCrudFormRequest } from "@/lib/hooks/useCrudFormRequest";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function ActivatePage() {
  const alias = "tenants_activate_retrieve";
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<"loading" | "success" | "error" | "invalid">(
    "loading"
  );
  const [message, setMessage] = useState<string>("Activating your account...");

  const { onSubmit } = useCrudFormRequest({
    alias,
    onSuccess: async (res) => {
      console.log(res);
      setStatus("success");
      setMessage(
        "Your account has been successfully activated. Login details and access link have been sent to your registered email."
      );
    },
    onError: async (err) => {
      const detail = err.response?.data?.detail || "Activation failed. Please try again.";
      setStatus("error");
      setMessage(detail);
    },
  });

  useEffect(() => {
    if (!token) {
      setStatus("invalid");
      setMessage("Invalid or missing activation token.");
      return;
    }

    onSubmit({ token });
    }, []);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6 text-center space-y-4">
        {status === "loading" && (
          <div className="text-blue-600 font-medium animate-pulse">{message}</div>
        )}

        {status === "success" && (
          <div className="text-green-600 font-semibold">{message}</div>
        )}

        {status === "error" && (
          <div className="text-red-600 font-semibold">{message}</div>
        )}

        {status === "invalid" && (
          <div className="text-yellow-600 font-semibold">{message}</div>
        )}
      </div>
    </div>
  );
}

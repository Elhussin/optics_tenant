


"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import RegisterForm from "@/src/components/form/RegisterForm";
import { RegisterFormData, MessageType } from "@/src/types/tenant";
import { registerTenant } from "@/src/lib/api/tenant";

export default function RegisterPage() {
  const [form, setForm] = useState<RegisterFormData>({
    name: "",
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<MessageType | null>(null);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const res = await registerTenant(form);
      setMessage({ type: "success", text: res.detail });
      setForm({ name: "", email: "", password: "" });
    } catch (error: any) {
      const msg =
        error.response?.data
          ? Object.values(error.response.data).flat().join(" ")
          : "Unexpected error occurred.";
      setMessage({ type: "error", text: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Register Your Store</h2>
        <RegisterForm form={form} onChange={handleChange} onSubmit={handleSubmit} message={message} loading={loading} />
      </div>
    </div>
  );
}

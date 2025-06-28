"use client";
import { useRouter } from "next/navigation";
import { api } from "@/src/lib/zodios-client";
import { toast } from "sonner";
export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    // Call the server-side logout endpoint to clear HTTP-only cookies
    await api.post("/api/users/logout/").then(() => {
      toast.success("Logged out successfully");
      router.push("/auth/login");
    }).catch((error) => {
      toast.error("Failed to log out");
    });
  };

  return (
    <button
      onClick={handleLogout}
      className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
    >
      Log Out
    </button>
  );
}

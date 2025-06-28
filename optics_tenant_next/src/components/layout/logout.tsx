"use client";
import { useRouter } from "next/navigation";
import { api } from "@/src/lib/zodios-client";
import { toast } from "sonner";
import { useUser } from  '@/src/lib/hooks/useCurrentUser'

export default function LogoutButton() {
  const router = useRouter();
  const { refreshUser } = useUser();
  const handleLogout = async () => {
    await api.post("/api/users/logout/").then(() => {
      toast.success("Logged out successfully");
        refreshUser(); 

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

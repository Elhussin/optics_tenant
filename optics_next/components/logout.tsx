"use client";
import { api } from "@/lib/zod-client/zodios-client";
import { toast } from "sonner";
import { useUser } from  '@/lib/hooks/useCurrentUser'
import { useRouter } from "next/navigation";
export default function LogoutButton() {
  const router = useRouter();
  const userContext = useUser();

  const handleLogout = async () => {
    try {
      await api.post("/api/users/logout/", {});
      toast.success("Logged out successfully");
      userContext?.refreshUser();
      router.push("/auth/login");
    } catch (error) {
      toast.error("Failed to log out");
      console.log(error);
    }
  };

  return (
    <button onClick={handleLogout} className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">
      Logout
    </button>
  );
}

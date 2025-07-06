"use client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
export default function LogoutButton({logout}: {logout: () => void}) {
  const router = useRouter();


  const handleLogout = async () => {
    try {
      logout();
      toast.success("Logged out successfully");
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

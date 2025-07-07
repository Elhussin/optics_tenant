"use client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Button from "./ui/Button";
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
    <>
    <Button
      label="Logout"
      onClick={handleLogout}
      variant="danger"
    />
  </>
  );
}

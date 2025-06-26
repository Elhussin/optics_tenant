"use client";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    // Call the server-side logout endpoint to clear HTTP-only cookies
    await fetch("/api/logout", { method: "POST", credentials: "include" });
    // Redirect to login page or home
    router.push("/login");
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

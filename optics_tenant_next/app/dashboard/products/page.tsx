'use client';

import { useEffect } from "react";
import { useRouter } from "next/navigation"; // هذا البديل المناسب
import { SecureRequest } from "@/lib/apiClient";

export default function MyComponent() {
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await SecureRequest("get", "your-endpoint/");
        console.log(data);
      } catch (err) {
        console.error("API Error", err);
        if (typeof window !== "undefined") {
          router.push("/login");
        }
      }
    };

    fetchData();
  }, [router]);

  return <div>Loading...</div>;
}

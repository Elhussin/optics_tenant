"use client";
import { useEffect, useState } from "react";

type GlobalAlertType = "info" | "warning" | "error" | "success";

export default function GlobalAlert() {
  const [message, setMessage] = useState<string | null>(null);
  const [type, setType] = useState<GlobalAlertType>("info");
  const [show, setShow] = useState(false);

  useEffect(() => {
    const getCookie = (name: string): string | null => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop()!.split(";").shift() || null;
      return null;
    };

    const alert = getCookie("alert_message");
    const alertType = getCookie("alert_type") as GlobalAlertType;

    if (alert) {
      setMessage(decodeURIComponent(alert));
      setType(alertType || "info");
      setShow(true);

      // حذف الكوكي بعد العرض
      document.cookie = "alert_message=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
      document.cookie = "alert_type=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";

      const timer = setTimeout(() => setShow(false), 5000);
      return () => clearTimeout(timer);
    }
  }, []);

  if (!show || !message) return null;

  const alertStyles = {
    info: "bg-blue-100 text-blue-800",
    warning: "bg-yellow-100 text-yellow-800",
    error: "bg-red-100 text-red-800",
    success: "bg-green-100 text-green-800",
  };

  return (
    <div className={`fixed left-1/2 transform -translate-x-1/2 -translate-y-1/2 p-4 rounded-md shadow-md ${alertStyles[type]}`}>
      {message}
      <button onClick={() => setShow(false)} className="ml-2 font-bold float-right">×</button>
    </div>
  );
}

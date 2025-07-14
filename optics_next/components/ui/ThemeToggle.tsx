// components/ThemeToggle.tsx
"use client"
import { useEffect, useState } from "react";
import {Moon, Sun} from "lucide-react"; // أيقونات جميلة
import { cn } from "@/lib/utils/utils";

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    if (localStorage.theme === "dark") {
      document.documentElement.classList.add("dark");
      setIsDark(true);
    } else {
      document.documentElement.classList.remove("dark");
      setIsDark(false);
    }
  }, []);

  const toggleTheme = () => {
    const html = document.documentElement;
    if (html.classList.contains("dark")) {
      html.classList.remove("dark");
      localStorage.theme = "light";
      setIsDark(false);
    } else {
      html.classList.add("dark");
      localStorage.theme = "dark";
      setIsDark(true);
    }

  };

  return (
    <button
  onClick={toggleTheme}
  className="relative p-2 rounded-full border border-gray-300 dark:border-gray-600 hover:scale-110 transition-transform"
  title={isDark ? "Active Light Mode" : "Active Dark Mode"}
>
  {isDark ? (
    <Moon size={18} className="text-yellow-300 hover:text-yellow-200" />
  ) : (
    <Sun size={18} className="text-yellow-500 hover:text-yellow-400" />
  )}
  <span className={cn("absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap", isDark ? "text-gray-500" : "text-gray-400")}>

  </span>
</button>
  );
}



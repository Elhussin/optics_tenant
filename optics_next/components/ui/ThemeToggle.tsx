// components/ThemeToggle.tsx
"use client"
import { useEffect, useState } from "react";
import {Moon, Sun} from "lucide-react"; // أيقونات جميلة
import { cn } from "@/utils/cn";

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
  className="relative p-1 rounded-full border border-gray-100 dark:border-gray-700 hover:scale-90 transition-transform"
  title={isDark ? "Active Light Mode" : "Active Dark Mode" }

>
  {isDark ? (
    <Sun size={16} className="text-yellow-300 hover:text-yellow-200 w-9 h-4"  />
  ) : (
    <Moon size={16} className="text-yellow-500 hover:text-yellow-400 w-9 h-4"  />
  )}

</button>
  );
}



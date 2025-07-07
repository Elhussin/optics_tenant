// components/ThemeToggle.tsx
"use client"
import { useEffect, useState } from "react";
import {Moon, Sun} from "lucide-react"; // أيقونات جميلة

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
    <button onClick={toggleTheme}>
      {isDark ? <Moon size={16} className="text-yellow-500 -yellow-500"/> : <Sun size={16} className="text-yellow-500" />}
    </button> 
  );
}



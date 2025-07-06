// components/ThemeToggle.tsx
"use client"
import { useEffect, useState } from "react";

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
      {isDark ? "🌞 Light " : "🌙 Dark "}
    </button>
  );
}



// On page load or when changing themes, best to add inline in `head` to avoid FOUC
// document.documentElement.classList.toggle(
//     "dark",
//     localStorage.theme === "dark" ||
//       (!("theme" in localStorage) && window.matchMedia("(prefers-color-scheme: dark)").matches),
//   );
//   // Whenever the user explicitly chooses light mode
//   localStorage.theme = "light";
//   // Whenever the user explicitly chooses dark mode
//   localStorage.theme = "dark";
//   // Whenever the user explicitly chooses to respect the OS preference
//   localStorage.removeItem("theme");
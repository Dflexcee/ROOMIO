import React, { useEffect, useState } from "react";

export default function DarkModeToggle() {
  const [dark, setDark] = useState(() => document.documentElement.classList.contains("dark"));

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setDark(document.documentElement.classList.contains("dark"));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  const toggleDark = () => {
    document.documentElement.classList.toggle("dark");
    setDark(document.documentElement.classList.contains("dark"));
  };

  return (
    <button
      onClick={toggleDark}
      className="fixed top-4 right-4 z-50 bg-gray-800 dark:bg-gray-200 text-yellow-300 dark:text-gray-900 px-3 py-2 rounded-full shadow-lg hover:bg-gray-700 dark:hover:bg-gray-300 transition"
      aria-label="Toggle dark mode"
      type="button"
    >
      {dark ? "☀️" : "🌙"}
    </button>
  );
} 
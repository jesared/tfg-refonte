"use client";

import { Moon, Sun } from "lucide-react";
import { useState } from "react";

const STORAGE_KEY = "theme";

type Theme = "light" | "dark";

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof document === "undefined") {
      return "light";
    }

    return document.documentElement.classList.contains("dark") ? "dark" : "light";
  });

  const toggleTheme = () => {
    const root = document.documentElement;
    const nextTheme: Theme = theme === "dark" ? "light" : "dark";

    root.classList.toggle("dark", nextTheme === "dark");
    root.style.colorScheme = nextTheme;
    window.localStorage.setItem(STORAGE_KEY, nextTheme);
    setTheme(nextTheme);
  };

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white/80 px-2 py-1.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-100 hover:text-slate-900 dark:border-slate-600 dark:bg-slate-800/90 dark:text-slate-100 dark:hover:bg-slate-700"
      aria-label="Basculer le thème clair/sombre"
      aria-pressed={isDark}
      title={isDark ? "Passer au mode clair" : "Passer au mode sombre"}
    >
      <span
        className={`flex h-6 w-11 items-center rounded-full p-0.5 transition-colors ${
          isDark ? "bg-slate-700" : "bg-amber-100"
        }`}
        aria-hidden="true"
      >
        <span
          className={`grid h-5 w-5 place-items-center rounded-full bg-white text-slate-700 shadow transition-transform ${
            isDark ? "translate-x-5" : "translate-x-0"
          }`}
        >
          {isDark ? <Moon className="h-3.5 w-3.5" /> : <Sun className="h-3.5 w-3.5" />}
        </span>
      </span>
      <span>{isDark ? "Sombre" : "Clair"}</span>
    </button>
  );
}

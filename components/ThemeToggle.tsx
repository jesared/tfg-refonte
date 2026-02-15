"use client";

import { Check, X } from "lucide-react";

const STORAGE_KEY = "theme";

export function ThemeToggle() {
  const toggleTheme = () => {
    const root = document.documentElement;
    const nextTheme = root.classList.contains("dark") ? "light" : "dark";

    root.classList.toggle("dark", nextTheme === "dark");
    root.style.colorScheme = nextTheme;
    window.localStorage.setItem(STORAGE_KEY, nextTheme);
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="inline-flex items-center gap-2 rounded-md border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-100 hover:text-slate-900"
      aria-label="Basculer le thème clair/sombre"
      title="Basculer le thème"
    >
      <Check className="h-4 w-4" />
      <X className="h-4 w-4" />
      <span>Thème</span>
    </button>
  );
}

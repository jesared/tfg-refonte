"use client";

import { Gift, Home, Mail, Scale, Table2, Trophy, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { SidebarItem } from "@/components/SidebarItem";
import { ThemeToggle } from "@/components/ThemeToggle";

const navigationItems = [
  { href: "/", label: "Accueil", icon: Home },
  { href: "/trophee", label: "Le Trophée", icon: Trophy },
  { href: "/tableaux", label: "Tableaux & Règlement", icon: Table2 },
  { href: "/classements", label: "Classements", icon: Scale },
  { href: "/recompenses", label: "Récompenses", icon: Gift },
  { href: "/contact", label: "Contact", icon: Mail },
];

const isItemActive = (pathname: string, href: string) => {
  if (href === "/") {
    return pathname === "/";
  }
  return pathname.startsWith(href);
};

export function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  /**
   * 🔒 Empêche le scroll derrière le menu mobile
   */
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <>
      {/* HEADER MOBILE */}
      <header className="border-b border-slate-200 bg-white md:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-slate-900">Trophée François Grieder</span>
            <span className="text-xs text-slate-500">Challenge régional de tennis de table</span>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button
              type="button"
              onClick={() => setIsOpen(true)}
              className="inline-flex items-center gap-2 rounded-md border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 shadow-sm"
              aria-expanded={isOpen}
              aria-controls="mobile-sidebar"
            >
              Menu
            </button>
          </div>
        </div>
      </header>

      {/* OVERLAY MOBILE */}
      <div
        className={`fixed inset-0 z-40 bg-black/40 transition-opacity md:hidden ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={() => setIsOpen(false)}
        aria-hidden="true"
      />

      {/* SIDEBAR MOBILE */}
      <div
        id="mobile-sidebar"
        className={`fixed inset-y-0 left-0 z-50 w-72 border-r border-slate-200 bg-white px-6 py-6 shadow-lg transition-transform md:hidden ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold text-slate-900">Navigation</div>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="rounded-md p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
            aria-label="Fermer le menu"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <nav className="mt-6 space-y-2">
          {navigationItems.map((item) => (
            <SidebarItem
              key={item.href}
              href={item.href}
              label={item.label}
              icon={item.icon}
              active={isItemActive(pathname, item.href)}
              onSelect={() => setIsOpen(false)}
            />
          ))}
        </nav>
      </div>

      {/* SIDEBAR DESKTOP */}
      <aside className="hidden border-r border-tfg-purple/60 bg-tfg-purple md:fixed md:inset-y-0 md:flex md:w-64 md:flex-col md:px-6 md:py-8">
        <div className="text-xs font-semibold uppercase tracking-wide text-white/60">
          Navigation
        </div>

        <nav className="mt-6 space-y-2">
          {navigationItems.map((item) => (
            <SidebarItem
              key={item.href}
              href={item.href}
              label={item.label}
              icon={item.icon}
              active={isItemActive(pathname, item.href)}
            />
          ))}
        </nav>

        <div className="mt-auto space-y-3 pt-8">
          <ThemeToggle />
          <div className="text-xs text-white/50">Trophée François Grieder</div>
        </div>
      </aside>
    </>
  );
}

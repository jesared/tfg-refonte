"use client";

import { CalendarDays, Gift, Home, Mail, Scale, Table2, Trophy, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { SidebarItem } from "@/components/SidebarItem";

const navigationItems = [
  { href: "/", label: "Accueil", icon: Home },
  { href: "/trophee", label: "Le Trophée", icon: Trophy },
  { href: "/saison-2024-2025", label: "Saison 2024–2025", icon: CalendarDays },
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

  return (
    <>
      <header className="border-b border-tfg-purpleSoft bg-tfg-purple md:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-white">Trophée François Grieder</span>
            <span className="text-xs text-tfg-light/80">Challenge régional de tennis de table</span>
          </div>
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="inline-flex items-center gap-2 rounded-md border border-tfg-yellow/50 px-3 py-2 text-sm font-medium text-tfg-light shadow-sm transition hover:bg-tfg-purpleSoft"
            aria-expanded={isOpen}
            aria-controls="mobile-sidebar"
          >
            Menu
          </button>
        </div>
      </header>

      <div
        className={`fixed inset-0 z-40 bg-black/50 transition-opacity md:hidden ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={() => setIsOpen(false)}
        aria-hidden="true"
      />
      <div
        id="mobile-sidebar"
        className={`fixed inset-y-0 left-0 z-50 w-72 border-r border-tfg-purpleSoft bg-tfg-purple px-6 py-6 shadow-lg transition-transform md:hidden ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold text-white">Navigation</div>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="rounded-md p-2 text-tfg-light/70 hover:bg-tfg-purpleSoft hover:text-white"
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

      <aside className="hidden border-r border-tfg-purpleSoft bg-tfg-purple md:fixed md:inset-y-0 md:flex md:w-64 md:flex-col md:px-6 md:py-8">
        <div className="text-xs font-semibold uppercase tracking-wide text-tfg-light/70">
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
        <div className="mt-auto pt-8 text-xs text-tfg-light/60">Trophée François Grieder</div>
      </aside>
    </>
  );
}

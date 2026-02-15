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

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const sidebarContent = (
    <>
      <div className="rounded-xl border border-border/70 bg-background/65 p-4 shadow-[0_10px_35px_hsl(var(--background)/0.65)] backdrop-blur">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary/45 via-primary/25 to-accent/35 text-primary shadow-sm">
            <Trophy className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Trophée François Grieder</p>
            <p className="text-xs text-muted-foreground">Challenge régional de tennis de table</p>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <div className="mb-3 px-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Navigation
        </div>
        <nav className="space-y-2">
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

      <div className="mt-auto space-y-3 rounded-xl border border-border/70 bg-background/55 p-4">
        <button
          type="button"
          className="group flex w-full items-center justify-between rounded-lg border border-primary/30 bg-primary/10 px-3 py-2 text-left transition hover:bg-primary/15"
        >
          <span className="flex items-center gap-2 text-sm font-medium text-primary">
            <Trophy className="h-4 w-4 text-accent" aria-hidden="true" />
            Suivre les résultats
          </span>
        </button>
        <ThemeToggle />
      </div>
    </>
  );

  return (
    <>
      <header className="border-b border-border/70 bg-card/90 backdrop-blur-md md:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-gradient-to-br from-primary/45 to-accent/35 text-primary">
              <Trophy className="h-4 w-4" aria-hidden="true" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-foreground">
                Trophée François Grieder
              </span>
              <span className="text-xs text-muted-foreground">Challenge régional</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button
              type="button"
              onClick={() => setIsOpen(true)}
              className="inline-flex items-center gap-2 rounded-lg border border-border/70 bg-background/70 px-3 py-2 text-sm font-medium text-foreground shadow-sm transition hover:border-primary/40 hover:text-primary"
              aria-expanded={isOpen}
              aria-controls="mobile-sidebar"
            >
              Menu
            </button>
          </div>
        </div>
      </header>

      <div
        className={`fixed inset-0 z-40 bg-background/75 backdrop-blur-sm transition-opacity md:hidden ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={() => setIsOpen(false)}
        aria-hidden="true"
      />

      <div
        id="mobile-sidebar"
        className={`fixed inset-y-0 left-0 z-50 flex w-80 max-w-[90vw] flex-col border-r border-border/80 bg-card/95 px-5 py-5 shadow-2xl backdrop-blur-xl transition-transform md:hidden ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        role="dialog"
        aria-modal="true"
      >
        <div className="mb-4 flex items-center justify-end">
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="rounded-md p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground"
            aria-label="Fermer le menu"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
        {sidebarContent}
      </div>

      <aside className="hidden border-r border-border/70 bg-card/70 md:fixed md:inset-y-0 md:flex md:w-72 md:flex-col md:px-5 md:py-6 md:backdrop-blur-xl">
        {sidebarContent}
      </aside>
    </>
  );
}

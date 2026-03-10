"use client";

import {
  CalendarDays,
  Gift,
  Home,
  Mail,
  Scale,
  ShieldCheck,
  Swords,
  Table2,
  Trophy,
  User,
  X,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { SidebarItem } from "@/components/SidebarItem";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ThemeToggle } from "@/components/ThemeToggle";
import LoginButton from "./LoginButton";

const navigationItems = [
  { href: "/", label: "Accueil", icon: Home },
  { href: "/trophee", label: "Le Trophée", icon: Trophy },
  { href: "/agenda", label: "Agenda & salles", icon: CalendarDays },
  { href: "/tableaux", label: "Tableaux & Règlement", icon: Table2 },
  { href: "/classements", label: "Classements", icon: Scale },
  { href: "/recompenses", label: "Récompenses", icon: Gift },
  { href: "/inscription", label: "Inscription", icon: User },
  { href: "/contact", label: "Contact", icon: Mail },
];

const adminItems = [
  { href: "/admin", label: "Tableau de bord", icon: ShieldCheck },
  { href: "/admin/tournaments", label: "Tournois", icon: Trophy },
  { href: "/admin/categories", label: "Catégories", icon: Swords },
  { href: "/admin/inscriptions", label: "Inscriptions", icon: User },
  { href: "/admin/utilisateurs", label: "Utilisateurs", icon: User },
];

const isItemActive = (pathname: string, href: string) => {
  if (href === "/") return pathname === "/";
  if (href === "/admin") return pathname === "/admin";
  return pathname.startsWith(href);
};

export function Sidebar() {
  const pathname = usePathname();
  const safePathname = pathname ?? ""; // 🔒 sécurisation TS
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "ADMIN";

  const [isOpen, setIsOpen] = useState(false);


  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <>
      {/* ===== MOBILE HEADER ===== */}
      <header className="border-b border-border bg-card md:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-foreground">Trophée François Grieder</span>
            <span className="text-xs text-muted-foreground">
              Challenge régional de tennis de table
            </span>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button
              type="button"
              onClick={() => setIsOpen(true)}
              className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-sm font-medium text-foreground shadow-sm"
              aria-expanded={isOpen}
              aria-controls="mobile-sidebar"
            >
              Menu
            </button>
          </div>
        </div>
      </header>

      {/* ===== MOBILE OVERLAY ===== */}
      <div
        className={`fixed inset-0 z-40 bg-black/50 transition-opacity md:hidden ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={() => setIsOpen(false)}
        aria-hidden="true"
      />

      {/* ===== MOBILE SIDEBAR ===== */}
      <div
        id="mobile-sidebar"
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col overflow-y-auto border-r border-border bg-card px-6 py-6 shadow-lg transition-transform md:hidden ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        role="dialog"
        aria-modal="true"
      >
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="text-sm font-semibold text-foreground">Trophée François Grieder</div>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label="Fermer le menu"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav className="space-y-2 pb-4">
          <Accordion
            type="single"
            collapsible
            defaultValue="site"
          >
            <AccordionItem value="site" className="border-b-0">
              <AccordionTrigger className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground hover:no-underline">
                Menu du site
              </AccordionTrigger>
              <AccordionContent className="pt-2">
                <div className="space-y-2">
                  {navigationItems.map((item) => (
                    <SidebarItem
                      key={item.href}
                      href={item.href}
                      label={item.label}
                      icon={item.icon}
                      active={isItemActive(safePathname, item.href)}
                      onSelect={() => setIsOpen(false)}
                    />
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          {isAdmin && (
            <Accordion
              type="single"
              collapsible
              defaultValue="admin"
              className="pt-4"
            >
              <AccordionItem value="admin" className="border-b-0">
                <AccordionTrigger className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground hover:no-underline">
                  Admin
                </AccordionTrigger>
                <AccordionContent className="pt-2">
                  <div className="space-y-2">
                    {adminItems.map((item) => (
                      <SidebarItem
                        key={item.href}
                        href={item.href}
                        label={item.label}
                        icon={item.icon}
                        active={isItemActive(safePathname, item.href)}
                        onSelect={() => setIsOpen(false)}
                      />
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          )}
        </nav>

        <div className="mt-auto space-y-3 border-t border-border pt-4">
          <ThemeToggle />
          <LoginButton />
        </div>
      </div>

      {/* ===== DESKTOP SIDEBAR ===== */}
      <aside className="hidden overflow-y-auto border-r border-border bg-card md:fixed md:inset-y-0 md:flex md:w-64 md:flex-col md:px-6 md:py-8">
        <div className="mb-6 text-sm font-semibold text-foreground">Trophée François Grieder</div>

        <nav className="space-y-2">
          <Accordion
            type="single"
            collapsible
            defaultValue="site"
          >
            <AccordionItem value="site" className="border-b-0">
              <AccordionTrigger className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground hover:no-underline">
                Menu du site
              </AccordionTrigger>
              <AccordionContent className="pt-2">
                <div className="space-y-2">
                  {navigationItems.map((item) => (
                    <SidebarItem
                      key={item.href}
                      href={item.href}
                      label={item.label}
                      icon={item.icon}
                      active={isItemActive(safePathname, item.href)}
                    />
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          {isAdmin && (
            <Accordion
              type="single"
              collapsible
              defaultValue="admin"
              className="pt-4"
            >
              <AccordionItem value="admin" className="border-b-0">
                <AccordionTrigger className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground hover:no-underline">
                  Admin
                </AccordionTrigger>
                <AccordionContent className="pt-2">
                  <div className="space-y-2">
                    {adminItems.map((item) => (
                      <SidebarItem
                        key={item.href}
                        href={item.href}
                        label={item.label}
                        icon={item.icon}
                        active={isItemActive(safePathname, item.href)}
                      />
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          )}
        </nav>

        <div className="mt-auto space-y-3 pt-8">
          <ThemeToggle />
          <LoginButton />
          <div className="text-xs text-muted-foreground">© {new Date().getFullYear()} TFG</div>
        </div>
      </aside>
    </>
  );
}

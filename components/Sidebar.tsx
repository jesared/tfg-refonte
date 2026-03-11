"use client";

import {
  CalendarDays,
  ChevronRight,
  Gift,
  Home,
  Mail,
  Scale,
  ShieldCheck,
  Swords,
  Table2,
  Trophy,
  User,
  UserRound,
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
import { cn } from "@/lib/utils";
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

const userSpaceItems = [
  { href: "/profile", label: "Mon profil", icon: UserRound },
  { href: "/mes-inscriptions", label: "À vos inscriptions", icon: Trophy },
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
  const safePathname = pathname ?? "";
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "ADMIN";

  const [isOpen, setIsOpen] = useState(false);
  const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(false);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    document.documentElement.style.setProperty(
      "--sidebar-width",
      isDesktopCollapsed ? "0rem" : "16rem",
    );

    return () => {
      document.documentElement.style.setProperty("--sidebar-width", "16rem");
    };
  }, [isDesktopCollapsed]);

  return (
    <>
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

      <div
        className={`fixed inset-0 z-40 bg-black/50 transition-opacity md:hidden ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={() => setIsOpen(false)}
        aria-hidden="true"
      />

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
          <Accordion type="single" collapsible defaultValue="site">
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

          {session?.user && (
            <Accordion type="single" collapsible defaultValue="espace" className="pt-4">
              <AccordionItem value="espace" className="border-b-0">
                <AccordionTrigger className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground hover:no-underline">
                  Mon espace
                </AccordionTrigger>
                <AccordionContent className="pt-2">
                  <div className="space-y-2">
                    {userSpaceItems.map((item) => (
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

          {isAdmin && (
            <Accordion type="single" collapsible defaultValue="admin" className="pt-4">
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

      {isDesktopCollapsed && (
        <button
          type="button"
          onClick={() => setIsDesktopCollapsed(false)}
          className="hidden rounded-md border border-border bg-card p-2 text-muted-foreground shadow-sm hover:bg-muted hover:text-foreground md:fixed md:left-4 md:top-4 md:z-50 md:inline-flex"
          aria-label="Déplier la barre latérale"
          title="Déplier"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      )}

      <aside
        className={cn(
          "hidden overflow-y-auto border-r border-border bg-card md:fixed md:inset-y-0 md:flex md:flex-col md:py-8 md:transition-[width,padding,border-color] md:duration-200",
          isDesktopCollapsed ? "md:w-0 md:border-r-transparent md:px-0 md:py-0" : "md:w-64 md:px-6",
        )}
      >
        {!isDesktopCollapsed && (
          <>
            <div className="mb-6 flex items-center justify-between">
              <div className="text-sm font-semibold text-foreground">Trophée François Grieder</div>
              <button
                type="button"
                onClick={() => setIsDesktopCollapsed(true)}
                className="rounded-md border border-border p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
                aria-label="Replier la barre latérale"
                title="Replier"
              >
                <ChevronRight className="h-4 w-4 rotate-180" />
              </button>
            </div>

            <nav className="space-y-2">
              <Accordion type="single" collapsible defaultValue="site">
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

              {session?.user && (
                <Accordion type="single" collapsible defaultValue="espace" className="pt-4">
                  <AccordionItem value="espace" className="border-b-0">
                    <AccordionTrigger className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground hover:no-underline">
                      Mon espace
                    </AccordionTrigger>
                    <AccordionContent className="pt-2">
                      <div className="space-y-2">
                        {userSpaceItems.map((item) => (
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

              {isAdmin && (
                <Accordion type="single" collapsible defaultValue="admin" className="pt-4">
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
          </>
        )}
      </aside>
    </>
  );
}

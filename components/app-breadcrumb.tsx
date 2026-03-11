"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import Link from "next/link";
import { usePathname } from "next/navigation";

const SEGMENT_LABELS: Record<string, string> = {
  actualites: "Actualités",
  admin: "Administration",
  agenda: "Agenda",
  classements: "Classements",
  contact: "Contact",
  inscription: "Inscription",
  inscriptions: "Inscriptions",
  "mes-inscriptions": "À vos inscriptions",
  profile: "Profil",
  recompenses: "Récompenses",
  salles: "Salles",
  tableaux: "Tableaux",
  trophee: "Trophée",
  tournois: "Tournois",
  users: "Joueurs",
  utilisateurs: "Utilisateurs",
};

function getSegmentLabel(segment: string): string {
  return (
    SEGMENT_LABELS[segment] ??
    decodeURIComponent(segment)
      .replace(/[-_]+/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase())
  );
}

export function AppBreadcrumb() {
  const pathname = usePathname();

  if (!pathname) {
    return null;
  }

  const segments = pathname.split("/").filter(Boolean);

  if (segments.length === 0) {
    return null;
  }

  return (
    <Breadcrumb className="ml-4 sm:ml-6">
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href="/">Accueil</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>

        {segments.map((segment, index) => {
          const href = `/${segments.slice(0, index + 1).join("/")}`;
          const isLast = index === segments.length - 1;

          return (
            <div key={href} className="contents">
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage>{getSegmentLabel(segment)}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link href={href}>{getSegmentLabel(segment)}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </div>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}

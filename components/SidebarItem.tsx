import type { LucideIcon } from "lucide-react";
import Link from "next/link";

import { cn } from "@/lib/utils";

type SidebarItemProps = {
  href: string;
  label: string;
  icon: LucideIcon;
  active?: boolean;
  onSelect?: () => void;
};

export function SidebarItem({
  href,
  label,
  icon: Icon,
  active = false,
  onSelect,
}: SidebarItemProps) {
  return (
    <Link
      href={href}
      onClick={onSelect}
      aria-current={active ? "page" : undefined}
      className={cn(
        "group relative flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
        active
          ? "bg-tfg-purple/10 text-tfg-purple"
          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
      )}
    >
      {/* barre active */}
      {active && (
        <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r bg-tfg-yellow" />
      )}

      <Icon
        className={cn(
          "h-4 w-4",
          active ? "text-tfg-yellow" : "text-slate-400 group-hover:text-slate-700",
        )}
      />

      <span>{label}</span>
    </Link>
  );
}

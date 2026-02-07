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
      className={cn(
        "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
        active
          ? "border-l-4 border-tfg-yellow bg-tfg-purple/90 text-white shadow-sm"
          : "text-slate-600 hover:bg-slate-200/70 hover:text-slate-900",
      )}
    >
      <Icon
        className={cn(
          "h-4 w-4 transition-colors",
          active ? "text-tfg-yellow" : "text-slate-400 group-hover:text-slate-700",
        )}
        aria-hidden="true"
      />
      <span className="truncate">{label}</span>
    </Link>
  );
}

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
        "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition",
        active
          ? "border-l-4 border-tfg-yellow bg-tfg-purpleSoft text-white shadow-sm"
          : "text-white/70 hover:bg-white/10 hover:text-white"
      )}
    >
      <Icon
        className={cn(
          "h-4 w-4 transition-colors",
          active ? "text-tfg-yellow" : "text-white/60 group-hover:text-white"
        )}
        aria-hidden="true"
      />
      <span>{label}</span>
    </Link>
  );
}

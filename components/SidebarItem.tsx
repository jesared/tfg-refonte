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
        "group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 ease-out",
        active
          ? "bg-accent/15 text-accent"
          : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
      )}
    >
      {active && <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r bg-accent" />}

      <Icon
        className={cn(
          "h-4 w-4 transition-all duration-200 ease-out",
          active ? "text-accent" : "text-muted-foreground group-hover:text-foreground",
        )}
      />

      <span>{label}</span>
    </Link>
  );
}

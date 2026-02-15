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
        "group relative flex items-center gap-3 overflow-hidden rounded-xl border px-3 py-2.5 text-sm font-medium transition-all duration-200",
        active
          ? "border-primary/35 bg-gradient-to-r from-primary/20 via-primary/10 to-accent/10 text-foreground shadow-[0_12px_26px_hsl(var(--primary)/0.18)]"
          : "border-transparent text-muted-foreground hover:border-border/80 hover:bg-muted/70 hover:text-foreground",
      )}
    >
      <span
        className={cn(
          "flex h-8 w-8 items-center justify-center rounded-lg transition-colors",
          active
            ? "bg-primary/25 text-primary"
            : "bg-muted/70 text-muted-foreground group-hover:text-foreground",
        )}
      >
        <Icon className="h-4 w-4" />
      </span>

      <span>{label}</span>

      <span
        aria-hidden="true"
        className={cn(
          "absolute inset-y-1 right-1 w-1 rounded-full transition-opacity",
          active ? "bg-accent opacity-100" : "opacity-0",
        )}
      />
    </Link>
  );
}

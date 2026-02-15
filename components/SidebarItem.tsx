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
        "group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
        "outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
        active
          ? "bg-primary text-primary-foreground shadow-sm"
          : "text-muted-foreground hover:bg-accent hover:text-primary-foreground",
      )}
    >
      {/* Icon */}
      <Icon
        className={cn(
          "h-4 w-4 transition-colors duration-200",
          active
            ? "text-accent-foreground"
            : "text-muted-foreground group-hover:text-primary-foreground",
        )}
      />

      {/* Label */}
      <span className="truncate">{label}</span>
    </Link>
  );
}

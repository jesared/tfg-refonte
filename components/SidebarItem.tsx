import Link from "next/link";
import type { LucideIcon } from "lucide-react";

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
  const iconClasses = active
    ? "h-4 w-4 text-tfg-yellow"
    : "h-4 w-4 text-tfg-light/70";

  return (
    <Link
      href={href}
      onClick={onSelect}
      className={`flex items-center gap-3 rounded-lg border-l-4 px-3 py-2 text-sm font-medium transition ${
        active
          ? "border-tfg-yellow bg-tfg-purpleSoft text-white shadow-sm"
          : "border-transparent text-tfg-light/80 hover:bg-tfg-purpleSoft/70 hover:text-white"
      }`}
    >
      <Icon className={iconClasses} aria-hidden="true" />
      <span>{label}</span>
    </Link>
  );
}

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
  return (
    <Link
      href={href}
      onClick={onSelect}
      className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
        active
          ? "bg-slate-900 text-white shadow-sm"
          : "text-slate-600 hover:bg-slate-200/70 hover:text-slate-900"
      }`}
    >
      <Icon className="h-4 w-4" aria-hidden="true" />
      <span>{label}</span>
    </Link>
  );
}

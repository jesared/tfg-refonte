import * as React from "react";

export type LucideIcon = React.FC<React.SVGProps<SVGSVGElement>>;

const defaultProps = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

function createIcon(
  displayName: string,
  path: React.ReactNode,
): React.FC<React.SVGProps<SVGSVGElement>> {
  const Icon = ({ className, ...props }: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" className={className} {...defaultProps} {...props}>
      {path}
    </svg>
  );

  Icon.displayName = displayName;

  return Icon;
}

export const CalendarDays = createIcon(
  "CalendarDays",
  <>
    <rect x="3" y="5" width="18" height="16" rx="2" />
    <line x1="16" y1="3" x2="16" y2="7" />
    <line x1="8" y1="3" x2="8" y2="7" />
    <line x1="3" y1="11" x2="21" y2="11" />
    <line x1="8" y1="15" x2="8" y2="17" />
    <line x1="12" y1="15" x2="12" y2="17" />
    <line x1="16" y1="15" x2="16" y2="17" />
  </>,
);

export const Check = createIcon(
  "Check",
  <>
    <polyline points="20 6 9 17 4 12" />
  </>,
);

export const ChevronRight = createIcon(
  "ChevronRight",
  <>
    <polyline points="9 18 15 12 9 6" />
  </>,
);

export const Dot = createIcon(
  "Dot",
  <>
    <circle cx="12" cy="12" r="1" />
  </>,
);

export const Gift = createIcon(
  "Gift",
  <>
    <rect x="3" y="8" width="18" height="13" rx="2" />
    <line x1="12" y1="8" x2="12" y2="21" />
    <path d="M12 8H6a3 3 0 0 1 0-6c3 0 6 6 6 6Z" />
    <path d="M12 8h6a3 3 0 1 0 0-6c-3 0-6 6-6 6Z" />
  </>,
);

export const Home = createIcon(
  "Home",
  <>
    <path d="M3 10.5L12 3l9 7.5" />
    <path d="M5 10v10h14V10" />
  </>,
);

export const Mail = createIcon(
  "Mail",
  <>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <polyline points="3,7 12,13 21,7" />
  </>,
);

export const Scale = createIcon(
  "Scale",
  <>
    <line x1="12" y1="3" x2="12" y2="21" />
    <line x1="6" y1="6" x2="18" y2="6" />
    <path d="M6 6l-4 7a4 4 0 0 0 8 0L6 6Z" />
    <path d="M18 6l-4 7a4 4 0 0 0 8 0l-4-7Z" />
  </>,
);

export const Swords = createIcon(
  "Swords",
  <>
    <path d="M3 21l7.5-7.5" />
    <path d="M14 7l7-7" />
    <path d="M14 7l3 3" />
    <path d="M8 13l3 3" />
    <path d="M21 14l-7.5 7.5" />
  </>,
);

export const Table2 = createIcon(
  "Table2",
  <>
    <rect x="3" y="4" width="18" height="16" rx="2" />
    <line x1="3" y1="10" x2="21" y2="10" />
    <line x1="9" y1="4" x2="9" y2="20" />
    <line x1="15" y1="4" x2="15" y2="20" />
  </>,
);

export const Trophy = createIcon(
  "Trophy",
  <>
    <path d="M8 4h8v4a4 4 0 0 1-8 0V4Z" />
    <path d="M6 4h-2a3 3 0 0 0 3 3" />
    <path d="M18 4h2a3 3 0 0 1-3 3" />
    <path d="M12 12v4" />
    <path d="M8 20h8" />
  </>,
);

export const X = createIcon(
  "X",
  <>
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </>,
);

export const Moon = createIcon(
  "Moon",
  <>
    <path d="M12 3a9 9 0 1 0 9 9 7 7 0 0 1-9-9Z" />
  </>,
);

export const Sun = createIcon(
  "Sun",
  <>
    <circle cx="12" cy="12" r="4" />
    <line x1="12" y1="2" x2="12" y2="5" />
    <line x1="12" y1="19" x2="12" y2="22" />
    <line x1="2" y1="12" x2="5" y2="12" />
    <line x1="19" y1="12" x2="22" y2="12" />
    <line x1="4.9" y1="4.9" x2="7" y2="7" />
    <line x1="17" y1="17" x2="19.1" y2="19.1" />
    <line x1="4.9" y1="19.1" x2="7" y2="17" />
    <line x1="17" y1="7" x2="19.1" y2="4.9" />
  </>,
);
export const Folder = createIcon(
  "Folder",
  <>
    <path d="M3 7a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z" />
  </>,
);

export const File = createIcon(
  "File",
  <>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
    <polyline points="14 2 14 8 20 8" />
  </>,
);

export const Image = createIcon(
  "Image",
  <>
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <path d="M21 15l-5-5L5 21" />
  </>,
);

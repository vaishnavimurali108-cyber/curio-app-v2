import type { Format } from "@/lib/types";

// Simple line-art motifs, one per experience format. Deliberately loose/
// hand-drawn feeling (uneven strokes) rather than a generic icon set —
// reinforces that these are curated, specific things, not database rows.
export function FormatIcon({
  format,
  className,
}: {
  format: Format | string;
  className?: string;
}) {
  const common = {
    viewBox: "0 0 48 48",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.6,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className,
  };

  switch (format) {
    case "Museum Tour":
      return (
        <svg {...common}>
          <path d="M8 18 L24 8 L40 18" />
          <path d="M10 18 V38 M18 18 V38 M30 18 V38 M38 18 V38" />
          <path d="M6 38 H42" />
          <path d="M6 42 H42" />
        </svg>
      );
    case "Lecdem":
      return (
        <svg {...common}>
          <path d="M12 40 L16 20 H32 L36 40" />
          <path d="M14 20 Q24 6 34 20" />
          <circle cx="24" cy="12" r="1.6" fill="currentColor" stroke="none" />
          <path d="M20 40 H28" />
        </svg>
      );
    case "Walking Tour":
      return (
        <svg {...common}>
          <path d="M17 8 a4 4 0 1 0 0.1 0" />
          <path d="M15 16 q-3 8 1 12 q3 3 1 9" />
          <path d="M25 20 q4 6 1 11 q-2 4 2 11" />
          <path d="M9 40 q4 -2 7 0" />
          <path d="M28 40 q4 -2 7 0" />
        </svg>
      );
    case "Roundtable":
      return (
        <svg {...common}>
          <circle cx="24" cy="24" r="12" />
          <circle cx="24" cy="8" r="2.2" />
          <circle cx="38" cy="18" r="2.2" />
          <circle cx="34" cy="34" r="2.2" />
          <circle cx="14" cy="34" r="2.2" />
          <circle cx="10" cy="18" r="2.2" />
        </svg>
      );
    case "Workshop":
      return (
        <svg {...common}>
          <path d="M30 12 l6 6 -14 14 -8 2 2 -8 z" />
          <path d="M10 38 l6 -6" />
          <path d="M33 9 l6 6" />
        </svg>
      );
    default:
      return (
        <svg {...common}>
          <circle cx="24" cy="24" r="14" />
          <path d="M24 17 v7 l5 4" />
        </svg>
      );
  }
}

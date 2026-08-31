import Link from "next/link";
import { MapPin, Clock } from "lucide-react";
import type { Experience } from "@/lib/types";
import { formatPrice, ticketCode } from "@/lib/utils";
import { FormatIcon } from "@/components/FormatIcon";

const FORMAT_LABEL: Record<string, string> = {
  "Museum Tour": "Museum Tour",
  Lecdem: "Lecture-Demo",
  "Walking Tour": "Walking Tour",
  Roundtable: "Roundtable",
  Workshop: "Workshop",
};

export function TicketCard({
  exp,
  delayMs = 0,
}: {
  exp: Experience;
  delayMs?: number;
}) {
  const full = exp.spots_taken >= exp.capacity;
  const date = new Date(exp.event_date);
  const day = date.getDate();
  const month = date.toLocaleDateString("en-US", { month: "short" });

  return (
    <Link
      href={`/experiences/${exp.id}`}
      className="group block animate-rise"
      style={{ "--delay": `${delayMs}ms` } as React.CSSProperties}
      aria-label={`View ${exp.title}`}
    >
      <div className="ticket-perforation relative overflow-hidden rounded-2xl border border-line bg-white shadow-sm transition-all duration-200 ease-out group-hover:-translate-y-0.5 group-hover:shadow-md group-active:scale-[0.98] group-active:shadow-sm">
        <span className="ticket-notch-l" aria-hidden />
        <span className="ticket-notch-r" aria-hidden />

        {/* Stub header */}
        <div className="relative flex items-center justify-between overflow-hidden bg-navy px-4 py-3 text-parchment">
          <FormatIcon
            format={exp.format}
            className="animate-drift pointer-events-none absolute -right-2 -top-2 h-20 w-20 text-parchment/[0.07]"
          />
          <div className="flex items-baseline gap-2">
            <span className="font-display text-2xl leading-none">{day}</span>
            <span className="font-mono text-[11px] uppercase tracking-wider text-parchment/70">
              {month}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {exp.is_exclusive && (
              <span className="rounded-full bg-brass px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-navy">
                Exclusive
              </span>
            )}
            <span className="font-mono text-[10px] uppercase tracking-wider text-parchment/50">
              #{ticketCode(exp.id)}
            </span>
          </div>
        </div>

        {/* Body */}
        <div className="px-4 pb-4 pt-6">
          <p className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-brass-dark">
            <FormatIcon format={exp.format} className="h-3.5 w-3.5" />
            {FORMAT_LABEL[exp.format] ?? exp.format} · {exp.category}
          </p>
          <h3 className="mt-1 font-display text-xl leading-snug text-ink">
            {exp.title}
          </h3>
          <div className="mt-3 flex flex-col gap-1 text-sm text-ink/60">
            <span className="flex items-center gap-1.5">
              <MapPin size={14} className="shrink-0" />
              {exp.location}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock size={14} className="shrink-0" />
              {exp.event_time}
            </span>
          </div>
        </div>

        {/* Stamp footer */}
        <div className="flex items-center justify-between border-t border-dashed border-line px-4 py-3">
          <span className="font-display text-lg text-teal">
            {formatPrice(exp.price)}
          </span>
          <span
            className={`font-mono text-[11px] uppercase tracking-wider ${
              full ? "text-stamp" : "text-ink/50"
            }`}
          >
            {full ? "Sold out" : `${exp.capacity - exp.spots_taken} spots left`}
          </span>
        </div>
      </div>
    </Link>
  );
}

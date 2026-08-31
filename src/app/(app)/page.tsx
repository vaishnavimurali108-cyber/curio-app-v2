"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { Experience, Format } from "@/lib/types";
import { TicketCard } from "@/components/TicketCard";
import { FormatIcon } from "@/components/FormatIcon";
import { formatPrice } from "@/lib/utils";

const FORMATS: (Format | "All")[] = [
  "All",
  "Museum Tour",
  "Lecdem",
  "Walking Tour",
  "Roundtable",
  "Workshop",
];

export default function DiscoverPage() {
  const supabase = createClient();
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [filter, setFilter] = useState<(Format | "All")>("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    supabase
      .from("experiences")
      .select("*")
      .gte("event_date", new Date().toISOString().slice(0, 10))
      .order("event_date", { ascending: true })
      .then(({ data, error }) => {
        if (!active) return;
        if (error) setError(error.message);
        setExperiences((data as Experience[]) ?? []);
        setLoading(false);
      });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(
    () =>
      filter === "All"
        ? experiences
        : experiences.filter((e) => e.format === filter),
    [experiences, filter]
  );

  const featured = useMemo(() => {
    if (experiences.length === 0) return null;
    return (
      experiences.find((e) => e.is_exclusive) ??
      experiences[0]
    );
  }, [experiences]);

  return (
    <div>
      <section className="mb-5 animate-rise">
        <p className="font-mono text-[11px] uppercase tracking-wider text-brass-dark">
          Curated, not just listed
        </p>
        <h1 className="relative mt-1 inline-block font-display text-3xl leading-tight text-navy">
          Experiences worth leaving the house for.
          <span className="animate-draw absolute -bottom-1 left-0 h-[3px] w-full bg-brass/70" />
        </h1>
        <p className="mt-3 text-sm text-ink/60">
          Museum tours, lecdems, walking tours — plus a few exclusive
          roundtables we've called in specialists for.
        </p>
      </section>

      {!loading && featured && (
        <Link
          href={`/experiences/${featured.id}`}
          className="group relative mb-6 block animate-rise overflow-hidden rounded-2xl bg-navy p-5 text-parchment shadow-md"
        >
          <div className="grain-navy absolute inset-0" aria-hidden />
          <FormatIcon
            format={featured.format}
            className="animate-drift pointer-events-none absolute -right-4 -top-4 h-32 w-32 text-parchment/[0.08]"
          />
          <div className="relative">
            <p className="font-mono text-[10px] uppercase tracking-wider text-brass">
              {featured.is_exclusive ? "Tonight's exclusive" : "Featured"}
            </p>
            <p className="mt-2 font-display text-xl leading-snug transition-transform duration-200 group-hover:translate-x-0.5">
              {featured.title}
            </p>
            <div className="mt-3 flex items-center justify-between">
              <span className="font-mono text-[11px] uppercase tracking-wider text-parchment/60">
                {new Date(featured.event_date).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}{" "}
                · {featured.event_time}
              </span>
              <span className="font-display text-brass">
                {formatPrice(featured.price)}
              </span>
            </div>
          </div>
        </Link>
      )}

      <div className="no-scrollbar mb-4 flex gap-2 overflow-x-auto">
        {FORMATS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`shrink-0 rounded-full border px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-wider transition-colors ${
              filter === f
                ? "border-navy bg-navy text-parchment"
                : "border-line bg-white text-ink/60"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {error && (
        <p className="rounded-xl border border-stamp/30 bg-stamp/5 p-3 text-sm text-stamp">
          Couldn't load experiences: {error}. Check your Supabase env vars.
        </p>
      )}

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-48 animate-pulse rounded-2xl border border-line bg-white/60"
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line p-8 text-center">
          <p className="font-display text-lg text-navy">Nothing here yet.</p>
          <p className="mt-1 text-sm text-ink/60">
            {experiences.length === 0
              ? "Once a curator adds an experience, it'll show up here."
              : "Try a different format."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((exp, i) => (
            <TicketCard key={exp.id} exp={exp} delayMs={i * 60} />
          ))}
        </div>
      )}
    </div>
  );
}

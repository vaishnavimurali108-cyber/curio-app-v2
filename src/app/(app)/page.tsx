"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Experience, Format } from "@/lib/types";
import { TicketCard } from "@/components/TicketCard";

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

  return (
    <div>
      <section className="mb-5 animate-rise">
        <p className="font-mono text-[11px] uppercase tracking-wider text-brass-dark">
          Curated, not just listed
        </p>
        <h1 className="mt-1 font-display text-3xl leading-tight text-navy">
          Experiences worth leaving the house for.
        </h1>
        <p className="mt-2 text-sm text-ink/60">
          Museum tours, lecdems, walking tours — plus a few exclusive
          roundtables we've called in specialists for.
        </p>
      </section>

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

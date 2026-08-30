"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/context/auth-context";
import type { Experience } from "@/lib/types";
import { formatPrice } from "@/lib/utils";

export default function DashboardPage() {
  const supabase = createClient();
  const { user, profile, loading: authLoading } = useAuth();
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading || !user) return;
    supabase
      .from("experiences")
      .select("*")
      .eq("curator_id", user.id)
      .order("event_date", { ascending: true })
      .then(({ data }) => {
        setExperiences((data as Experience[]) ?? []);
        setLoading(false);
      });
  }, [user, authLoading, supabase]);

  async function handleDelete(id: string) {
    setDeletingId(id);
    const { error } = await supabase.from("experiences").delete().eq("id", id);
    setDeletingId(null);
    if (!error) {
      setExperiences((prev) => prev.filter((e) => e.id !== id));
    }
  }

  if (!authLoading && !user) {
    return (
      <div className="rounded-2xl border border-dashed border-line p-8 text-center">
        <p className="font-display text-lg text-navy">Sign in as a curator to continue.</p>
        <Link
          href="/login"
          className="mt-3 inline-block rounded-lg bg-navy px-4 py-2 font-mono text-[11px] uppercase tracking-wider text-parchment"
        >
          Sign in
        </Link>
      </div>
    );
  }

  if (!authLoading && profile && profile.role !== "curator") {
    return (
      <div className="rounded-2xl border border-dashed border-line p-8 text-center">
        <p className="font-display text-lg text-navy">Curators only.</p>
        <p className="mt-1 text-sm text-ink/60">
          Your account is registered as a learner. Sign up again with the
          curator option to host experiences.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl text-navy">Your experiences</h1>
        <Link
          href="/dashboard/new"
          className="flex items-center gap-1 rounded-lg bg-brass px-3 py-2 font-mono text-[11px] uppercase tracking-wider text-navy"
        >
          <Plus size={14} /> New
        </Link>
      </div>

      {loading ? (
        <div className="mt-4 h-32 animate-pulse rounded-2xl bg-white/60" />
      ) : experiences.length === 0 ? (
        <div className="mt-4 rounded-2xl border border-dashed border-line p-8 text-center">
          <p className="font-display text-lg text-navy">Nothing curated yet.</p>
          <p className="mt-1 text-sm text-ink/60">
            Add your first experience — a tour, a lecdem, a roundtable.
          </p>
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          {experiences.map((exp) => (
            <div
              key={exp.id}
              className="rounded-2xl border border-line bg-white p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-wider text-brass-dark">
                    {exp.format}
                  </p>
                  <p className="mt-0.5 font-display text-lg text-navy">
                    {exp.title}
                  </p>
                  <p className="mt-1 text-sm text-ink/60">
                    {new Date(exp.event_date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}{" "}
                    · {exp.spots_taken}/{exp.capacity} booked ·{" "}
                    {formatPrice(exp.price)}
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <Link
                    href={`/dashboard/${exp.id}/edit`}
                    className="rounded-lg border border-line p-2 text-ink/60"
                    aria-label="Edit"
                  >
                    <Pencil size={14} />
                  </Link>
                  <button
                    onClick={() => handleDelete(exp.id)}
                    disabled={deletingId === exp.id}
                    className="rounded-lg border border-stamp/30 p-2 text-stamp disabled:opacity-40"
                    aria-label="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

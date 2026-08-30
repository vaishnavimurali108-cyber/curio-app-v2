"use client";

import { useEffect, useState, use as usePromise } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Clock, CalendarDays, Check } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/context/auth-context";
import type { Experience } from "@/lib/types";
import { formatPrice, ticketCode } from "@/lib/utils";

export default function ExperienceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = usePromise(params);
  const supabase = createClient();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [exp, setExp] = useState<Experience | null>(null);
  const [loading, setLoading] = useState(true);
  const [alreadyBooked, setAlreadyBooked] = useState(false);
  const [step, setStep] = useState<"view" | "confirm" | "done">("view");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    async function load() {
      const { data } = await supabase
        .from("experiences")
        .select("*")
        .eq("id", id)
        .single();
      if (!active) return;
      setExp(data as Experience);

      if (user) {
        const { data: booking } = await supabase
          .from("bookings")
          .select("id")
          .eq("experience_id", id)
          .eq("user_id", user.id)
          .eq("status", "confirmed")
          .maybeSingle();
        if (active && booking) {
          setAlreadyBooked(true);
          setStep("done");
        }
      }
      setLoading(false);
    }
    load();
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, user]);

  async function confirmBooking() {
    if (!exp || !user) return;
    setBusy(true);
    setError(null);
    const { error } = await supabase.from("bookings").insert({
      experience_id: exp.id,
      user_id: user.id,
    });
    setBusy(false);
    if (error) {
      setError(
        error.code === "23505"
          ? "You've already reserved a spot for this one."
          : error.message
      );
      return;
    }
    setExp({ ...exp, spots_taken: exp.spots_taken + 1 });
    setAlreadyBooked(true);
    setStep("done");
  }

  if (loading || authLoading) {
    return <div className="h-64 animate-pulse rounded-2xl bg-white/60" />;
  }

  if (!exp) {
    return (
      <div className="rounded-2xl border border-dashed border-line p-8 text-center">
        <p className="font-display text-lg text-navy">
          Couldn't find that one.
        </p>
        <p className="mt-1 text-sm text-ink/60">
          It may have been removed by its curator.
        </p>
      </div>
    );
  }

  const full = exp.spots_taken >= exp.capacity;
  const date = new Date(exp.event_date);

  return (
    <div>
      <p className="font-mono text-[11px] uppercase tracking-wider text-brass-dark">
        {exp.format} · {exp.category}
      </p>
      <h1 className="mt-1 font-display text-2xl leading-tight text-navy">
        {exp.title}
      </h1>

      <div className="mt-4 space-y-2 text-sm text-ink/70">
        <p className="flex items-center gap-2">
          <CalendarDays size={16} />
          {date.toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
          })}
        </p>
        <p className="flex items-center gap-2">
          <Clock size={16} />
          {exp.event_time}
        </p>
        <p className="flex items-center gap-2">
          <MapPin size={16} />
          {exp.location}
        </p>
      </div>

      <p className="mt-4 text-sm leading-relaxed text-ink/80">
        {exp.description}
      </p>

      <div className="my-5 border-t border-dashed border-line" />

      {step === "done" ? (
        <div className="rounded-2xl border border-teal/30 bg-teal/5 p-5 text-center">
          <div className="animate-stamp mx-auto flex h-14 w-14 items-center justify-center rounded-full border-4 border-teal text-teal">
            <Check size={26} strokeWidth={3} />
          </div>
          <p className="mt-3 font-display text-lg text-teal">
            {alreadyBooked ? "You're going." : "Reserved."}
          </p>
          <p className="mt-1 font-mono text-xs uppercase tracking-wider text-ink/50">
            Ticket #{ticketCode(exp.id)}
          </p>
          <button
            onClick={() => router.push("/bookings")}
            className="mt-4 rounded-lg bg-navy px-4 py-2 font-mono text-[11px] uppercase tracking-wider text-parchment"
          >
            View my tickets
          </button>
        </div>
      ) : step === "confirm" ? (
        <div className="rounded-2xl border border-line bg-white p-5">
          <p className="font-display text-lg text-navy">Confirm your spot</p>
          <div className="mt-3 flex items-center justify-between border-t border-dashed border-line pt-3">
            <span className="text-sm text-ink/60">1 ticket</span>
            <span className="font-display text-lg text-teal">
              {formatPrice(exp.price)}
            </span>
          </div>
          {error && <p className="mt-2 text-sm text-stamp">{error}</p>}
          <div className="mt-4 flex gap-2">
            <button
              onClick={() => setStep("view")}
              className="flex-1 rounded-lg border border-line py-2.5 font-mono text-[11px] uppercase tracking-wider text-ink/60"
            >
              Back
            </button>
            <button
              onClick={confirmBooking}
              disabled={busy}
              className="flex-1 rounded-lg bg-brass py-2.5 font-mono text-[11px] uppercase tracking-wider text-navy disabled:opacity-50"
            >
              {busy
                ? "Confirming…"
                : exp.price === 0
                ? "Reserve — free"
                : `Pay ${formatPrice(exp.price)}`}
            </button>
          </div>
          <p className="mt-3 text-center text-[11px] text-ink/40">
            Prototype checkout — no real payment is charged.
          </p>
        </div>
      ) : (
        <button
          onClick={() => {
            if (!user) {
              router.push("/login");
              return;
            }
            setStep("confirm");
          }}
          disabled={full}
          className="w-full rounded-lg bg-navy py-3 font-mono text-[12px] uppercase tracking-wider text-parchment disabled:opacity-40"
        >
          {full
            ? "Sold out"
            : `Reserve · ${formatPrice(exp.price)}`}
        </button>
      )}
    </div>
  );
}

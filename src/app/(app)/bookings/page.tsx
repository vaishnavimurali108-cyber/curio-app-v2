"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/context/auth-context";
import type { Booking } from "@/lib/types";
import { formatPrice, ticketCode } from "@/lib/utils";

export default function BookingsPage() {
  const supabase = createClient();
  const { user, loading: authLoading } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setLoading(false);
      return;
    }
    supabase
      .from("bookings")
      .select("*, experience:experiences(*)")
      .eq("user_id", user.id)
      .eq("status", "confirmed")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setBookings((data as unknown as Booking[]) ?? []);
        setLoading(false);
      });
  }, [user, authLoading, supabase]);

  if (!authLoading && !user) {
    return (
      <div className="rounded-2xl border border-dashed border-line p-8 text-center">
        <p className="font-display text-lg text-navy">Sign in to see your tickets.</p>
        <Link
          href="/login"
          className="mt-3 inline-block rounded-lg bg-navy px-4 py-2 font-mono text-[11px] uppercase tracking-wider text-parchment"
        >
          Sign in
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-display text-2xl text-navy">My Tickets</h1>

      {loading ? (
        <div className="mt-4 h-32 animate-pulse rounded-2xl bg-white/60" />
      ) : bookings.length === 0 ? (
        <div className="mt-4 rounded-2xl border border-dashed border-line p-8 text-center">
          <p className="font-display text-lg text-navy">No tickets yet.</p>
          <p className="mt-1 text-sm text-ink/60">
            Reserve a spot on something and it'll show up here.
          </p>
          <Link
            href="/"
            className="mt-3 inline-block rounded-lg bg-brass px-4 py-2 font-mono text-[11px] uppercase tracking-wider text-navy"
          >
            Discover experiences
          </Link>
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          {bookings.map((b) => (
            <Link
              key={b.id}
              href={`/experiences/${b.experience_id}`}
              className="block rounded-2xl border border-line bg-white p-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-wider text-brass-dark">
                    #{ticketCode(b.id)}
                  </p>
                  <p className="mt-0.5 font-display text-lg text-navy">
                    {b.experience?.title}
                  </p>
                  <p className="mt-1 text-sm text-ink/60">
                    {b.experience &&
                      new Date(b.experience.event_date).toLocaleDateString(
                        "en-US",
                        { month: "short", day: "numeric" }
                      )}{" "}
                    · {b.experience?.event_time}
                  </p>
                </div>
                <span className="rounded-full bg-teal/10 px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-teal">
                  Confirmed
                </span>
              </div>
              {b.experience && (
                <p className="mt-2 border-t border-dashed border-line pt-2 text-right font-display text-teal">
                  {formatPrice(b.experience.price)}
                </p>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

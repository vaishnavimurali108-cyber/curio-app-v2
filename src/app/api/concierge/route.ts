import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

interface ExperienceRow {
  id: string;
  title: string;
  description: string;
  category: string;
  format: string;
  location: string;
  event_date: string;
  event_time: string;
  price: number;
  is_exclusive: boolean;
  spots_taken: number;
  capacity: number;
}

// Lightweight keyword-based matcher — no external API, no cost.
// Swap this out for a real Claude API call later once you have API
// credits; the response shape is identical either way, so nothing
// else in the app needs to change.
function scoreExperience(query: string, exp: ExperienceRow): number {
  const q = query.toLowerCase();
  const haystack =
    `${exp.title} ${exp.description} ${exp.category} ${exp.format} ${exp.location}`.toLowerCase();

  let score = 0;
  const words = q.split(/\W+/).filter((w) => w.length > 2);
  for (const w of words) {
    if (haystack.includes(w)) score += 2;
  }

  const intentMap: Record<string, string[]> = {
    history: ["museum tour", "history"],
    art: ["art", "roundtable"],
    hands: ["workshop"],
    craft: ["workshop"],
    walk: ["walking tour"],
    evening: ["6:", "7:", "8:", "pm"],
    morning: ["am"],
    free: ["free"],
    expert: ["roundtable", "exclusive"],
    budget: ["free"],
    exclusive: ["exclusive", "roundtable"],
  };
  for (const [key, hints] of Object.entries(intentMap)) {
    if (q.includes(key)) {
      for (const hint of hints) {
        if (haystack.includes(hint)) score += 1;
      }
    }
  }

  return score;
}

export async function POST(req: Request) {
  const { message } = await req.json();

  if (!message || typeof message !== "string") {
    return NextResponse.json({ error: "Missing message" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: experiences } = await supabase
    .from("experiences")
    .select(
      "id, title, description, category, format, location, event_date, event_time, price, is_exclusive, spots_taken, capacity"
    )
    .gte("event_date", new Date().toISOString().slice(0, 10))
    .order("event_date", { ascending: true })
    .limit(40);

  const available = ((experiences as ExperienceRow[]) ?? []).filter(
    (e) => e.spots_taken < e.capacity
  );

  if (available.length === 0) {
    return NextResponse.json({
      reply:
        "There's nothing open on the calendar right now — check back once a curator adds something new.",
      recommended: [],
    });
  }

  const scored = available
    .map((e) => ({ exp: e, score: scoreExperience(message, e) }))
    .sort((a, b) => b.score - a.score);

  const hasMatches = scored[0].score > 0;
  const top = (hasMatches ? scored.filter((s) => s.score > 0) : scored).slice(
    0,
    3
  );

  const reply = hasMatches
    ? `Based on what you're curious about, I'd point you toward ${top
        .map((t) => `"${t.exp.title}"`)
        .join(top.length > 1 ? " or " : "")} — ${
        top.length > 1 ? "either one" : "it"
      } fits what you described.`
    : `Nothing matched that exactly, but here's what's on soon — ${top
        .map((t) => `"${t.exp.title}"`)
        .join(", ")} might still be worth a look.`;

  return NextResponse.json({
    reply,
    recommended: top.map((t) => t.exp),
  });
}

import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";

// Swap this for whatever the latest model string is at
// https://docs.claude.com/en/docs/about-claude/models if it changes.
const MODEL = "claude-sonnet-4-5";

export async function POST(req: Request) {
  const { message } = await req.json();

  if (!message || typeof message !== "string") {
    return NextResponse.json({ error: "Missing message" }, { status: 400 });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      {
        error:
          "ANTHROPIC_API_KEY is not set on the server. Add it in your deployment's environment variables.",
      },
      { status: 500 }
    );
  }

  const supabase = await createClient();
  const { data: experiences } = await supabase
    .from("experiences")
    .select("id, title, description, category, format, location, event_date, event_time, price, is_exclusive, spots_taken, capacity")
    .gte("event_date", new Date().toISOString().slice(0, 10))
    .order("event_date", { ascending: true })
    .limit(40);

  const catalogue = (experiences ?? [])
    .filter((e) => e.spots_taken < e.capacity)
    .map(
      (e) =>
        `- id: ${e.id} | "${e.title}" | ${e.format} | ${e.category} | ${e.location} | ${e.event_date} ${e.event_time} | ₹${e.price}${e.is_exclusive ? " | EXCLUSIVE" : ""}\n  ${e.description}`
    )
    .join("\n");

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const system = `You are Curio's concierge — a knowledgeable, warm guide who matches people to experiences (museum tours, lecdems, walking tours, workshops, and exclusive expert roundtables) based on what they say they're curious about, their mood, or how much time/money they have.

Only recommend experiences from the catalogue below — never invent ones. If nothing in the catalogue fits well, say so honestly and suggest the closest alternative.

Respond with ONLY valid JSON, no markdown fences, no preamble, matching exactly this shape:
{"reply": "one warm, specific paragraph (2-4 sentences) explaining your picks", "recommendation_ids": ["id1", "id2"]}

recommendation_ids should have 1-3 ids from the catalogue, ordered best-fit first. Use [] if nothing fits.

Catalogue:
${catalogue || "(no upcoming experiences yet)"}`;

  try {
    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 500,
      system,
      messages: [{ role: "user", content: message }],
    });

    const textBlock = response.content.find((b) => b.type === "text");
    const raw = textBlock && "text" in textBlock ? textBlock.text : "{}";

    let parsed: { reply: string; recommendation_ids: string[] };
    try {
      parsed = JSON.parse(raw.trim().replace(/^```json\s*|```$/g, ""));
    } catch {
      parsed = { reply: raw, recommendation_ids: [] };
    }

    const recommended = (experiences ?? []).filter((e) =>
      parsed.recommendation_ids?.includes(e.id)
    );

    return NextResponse.json({ reply: parsed.reply, recommended });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Concierge is unavailable right now. Try again shortly." },
      { status: 500 }
    );
  }
}

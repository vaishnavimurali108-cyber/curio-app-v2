"use client";

import { useState } from "react";
import { Sparkles, Send } from "lucide-react";
import { TicketCard } from "@/components/TicketCard";
import type { Experience } from "@/lib/types";

const PROMPTS = [
  "I have a free evening and love history",
  "Something hands-on for two people",
  "I want to meet an expert, budget no object",
];

interface Turn {
  question: string;
  reply?: string;
  recommended?: Experience[];
  error?: string;
}

export default function ConciergePage() {
  const [input, setInput] = useState("");
  const [turns, setTurns] = useState<Turn[]>([]);
  const [loading, setLoading] = useState(false);

  async function ask(question: string) {
    if (!question.trim() || loading) return;
    setInput("");
    setLoading(true);
    setTurns((t) => [...t, { question }]);

    try {
      const res = await fetch("/api/concierge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: question }),
      });
      const data = await res.json();
      setTurns((t) => {
        const copy = [...t];
        const last = copy[copy.length - 1];
        if (data.error) {
          copy[copy.length - 1] = { ...last, error: data.error };
        } else {
          copy[copy.length - 1] = {
            ...last,
            reply: data.reply,
            recommended: data.recommended,
          };
        }
        return copy;
      });
    } catch {
      setTurns((t) => {
        const copy = [...t];
        copy[copy.length - 1] = {
          ...copy[copy.length - 1],
          error: "Something went wrong reaching the concierge.",
        };
        return copy;
      });
    }
    setLoading(false);
  }

  return (
    <div>
      <div className="flex items-center gap-2">
        <Sparkles
          size={18}
          className={`text-brass-dark ${loading ? "animate-glow" : ""}`}
        />
        <h1 className="font-display text-2xl text-navy">Concierge</h1>
      </div>
      <p className="mt-1 text-sm text-ink/60">
        Tell it what you're in the mood for — it'll pick from what's actually
        happening, not just filter a list.
      </p>

      {turns.length === 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {PROMPTS.map((p) => (
            <button
              key={p}
              onClick={() => ask(p)}
              className="rounded-full border border-line bg-white px-3 py-1.5 text-left text-sm text-ink/70"
            >
              {p}
            </button>
          ))}
        </div>
      )}

      <div className="mt-5 space-y-5">
        {turns.map((t, i) => (
          <div key={i}>
            <p className="ml-auto w-fit max-w-[85%] rounded-2xl rounded-tr-sm bg-navy px-3.5 py-2 text-sm text-parchment">
              {t.question}
            </p>
            {t.error ? (
              <p className="mt-2 text-sm text-stamp">{t.error}</p>
            ) : t.reply ? (
              <>
                <p className="mt-2 max-w-[90%] rounded-2xl rounded-tl-sm border border-line bg-white px-3.5 py-2.5 text-sm text-ink/80">
                  {t.reply}
                </p>
                {t.recommended && t.recommended.length > 0 && (
                  <div className="mt-3 space-y-3">
                    {t.recommended.map((exp, i) => (
                      <TicketCard key={exp.id} exp={exp} delayMs={i * 80} />
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="mt-2 flex items-center gap-2 rounded-2xl border border-line bg-white px-3.5 py-2.5">
                <Sparkles size={14} className="animate-glow text-brass-dark" />
                <span className="text-sm text-ink/50">
                  Reading through what's on…
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          ask(input);
        }}
        className="sticky bottom-20 mt-5 flex gap-2 rounded-full border border-line bg-white p-1.5 shadow-sm"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="What are you curious about?"
          className="flex-1 bg-transparent px-3 text-sm outline-none"
        />
        <button
          type="submit"
          disabled={loading}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brass text-navy disabled:opacity-50"
          aria-label="Send"
        >
          <Send size={16} />
        </button>
      </form>
    </div>
  );
}

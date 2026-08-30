"use client";

import { useState } from "react";
import type { Experience, Format } from "@/lib/types";

const FORMATS: Format[] = [
  "Museum Tour",
  "Lecdem",
  "Walking Tour",
  "Roundtable",
  "Workshop",
];

export interface ExperienceFormValues {
  title: string;
  description: string;
  category: string;
  format: Format;
  location: string;
  event_date: string;
  event_time: string;
  price: number;
  capacity: number;
  is_exclusive: boolean;
}

export function ExperienceForm({
  initial,
  submitLabel,
  onSubmit,
}: {
  initial?: Partial<Experience>;
  submitLabel: string;
  onSubmit: (values: ExperienceFormValues) => Promise<string | void>;
}) {
  const [values, setValues] = useState<ExperienceFormValues>({
    title: initial?.title ?? "",
    description: initial?.description ?? "",
    category: initial?.category ?? "",
    format: (initial?.format as Format) ?? "Museum Tour",
    location: initial?.location ?? "",
    event_date: initial?.event_date ?? "",
    event_time: initial?.event_time ?? "",
    price: initial?.price ?? 0,
    capacity: initial?.capacity ?? 20,
    is_exclusive: initial?.is_exclusive ?? false,
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof ExperienceFormValues>(
    key: K,
    val: ExperienceFormValues[K]
  ) {
    setValues((v) => ({ ...v, [key]: val }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const result = await onSubmit(values);
    setBusy(false);
    if (typeof result === "string") setError(result);
  }

  const inputCls =
    "mt-1 w-full rounded-lg border border-line bg-white px-3 py-2.5 text-sm outline-none focus:border-brass";
  const labelCls = "font-mono text-[11px] uppercase tracking-wider text-ink/50";

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className={labelCls}>Title</label>
        <input
          required
          value={values.title}
          onChange={(e) => set("title", e.target.value)}
          className={inputCls}
          placeholder="After Hours at the City Museum"
        />
      </div>

      <div>
        <label className={labelCls}>Description</label>
        <textarea
          required
          rows={4}
          value={values.description}
          onChange={(e) => set("description", e.target.value)}
          className={inputCls}
          placeholder="What makes this worth showing up for?"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>Format</label>
          <select
            value={values.format}
            onChange={(e) => set("format", e.target.value as Format)}
            className={inputCls}
          >
            {FORMATS.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelCls}>Category</label>
          <input
            required
            value={values.category}
            onChange={(e) => set("category", e.target.value)}
            className={inputCls}
            placeholder="History, Art…"
          />
        </div>
      </div>

      <div>
        <label className={labelCls}>Location</label>
        <input
          required
          value={values.location}
          onChange={(e) => set("location", e.target.value)}
          className={inputCls}
          placeholder="Venue and area"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>Date</label>
          <input
            required
            type="date"
            value={values.event_date}
            onChange={(e) => set("event_date", e.target.value)}
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>Time</label>
          <input
            required
            value={values.event_time}
            onChange={(e) => set("event_time", e.target.value)}
            className={inputCls}
            placeholder="6:30 PM"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>Price (₹, 0 = free)</label>
          <input
            required
            type="number"
            min={0}
            value={values.price}
            onChange={(e) => set("price", Number(e.target.value))}
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>Capacity</label>
          <input
            required
            type="number"
            min={1}
            value={values.capacity}
            onChange={(e) => set("capacity", Number(e.target.value))}
            className={inputCls}
          />
        </div>
      </div>

      <label className="flex items-center gap-2 pt-1 text-sm text-ink/70">
        <input
          type="checkbox"
          checked={values.is_exclusive}
          onChange={(e) => set("is_exclusive", e.target.checked)}
          className="h-4 w-4 accent-brass"
        />
        Mark as an exclusive Curio roundtable
      </label>

      {error && <p className="text-sm text-stamp">{error}</p>}

      <button
        type="submit"
        disabled={busy}
        className="w-full rounded-lg bg-navy py-2.5 font-mono text-[12px] uppercase tracking-wider text-parchment disabled:opacity-50"
      >
        {busy ? "Saving…" : submitLabel}
      </button>
    </form>
  );
}

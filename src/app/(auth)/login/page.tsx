"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const supabase = createClient();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    router.push("/");
    router.refresh();
  }

  return (
    <>
      <h1 className="font-display text-xl text-navy">Welcome back</h1>
      <p className="mt-1 text-sm text-ink/60">Sign in to book or curate.</p>

      <form onSubmit={handleSubmit} className="mt-5 space-y-3">
        <div>
          <label className="font-mono text-[11px] uppercase tracking-wider text-ink/50">
            Email
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-lg border border-line bg-white px-3 py-2.5 text-sm outline-none focus:border-brass"
            placeholder="you@example.com"
          />
        </div>
        <div>
          <label className="font-mono text-[11px] uppercase tracking-wider text-ink/50">
            Password
          </label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-lg border border-line bg-white px-3 py-2.5 text-sm outline-none focus:border-brass"
            placeholder="••••••••"
          />
        </div>

        {error && <p className="text-sm text-stamp">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-navy py-2.5 font-mono text-[12px] uppercase tracking-wider text-parchment disabled:opacity-50"
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-ink/60">
        New here?{" "}
        <Link href="/signup" className="text-brass-dark underline">
          Create an account
        </Link>
      </p>
    </>
  );
}

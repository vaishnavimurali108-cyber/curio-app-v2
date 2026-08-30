"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Role } from "@/lib/types";

export default function SignupPage() {
  const supabase = createClient();
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("learner");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName, role } },
    });

    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }

    // If email confirmation is off in Supabase, there's already a session.
    if (data.session) {
      router.push("/");
      router.refresh();
    } else {
      setDone(true);
    }
  }

  if (done) {
    return (
      <div className="text-center">
        <h1 className="font-display text-xl text-navy">Almost there</h1>
        <p className="mt-2 text-sm text-ink/60">
          Check {email} to confirm your account, then sign in.
        </p>
        <Link
          href="/login"
          className="mt-4 inline-block font-mono text-[12px] uppercase tracking-wider text-brass-dark underline"
        >
          Go to sign in
        </Link>
      </div>
    );
  }

  return (
    <>
      <h1 className="font-display text-xl text-navy">Join Curio</h1>
      <p className="mt-1 text-sm text-ink/60">
        Come to learn, or bring something to teach.
      </p>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => setRole("learner")}
          className={`rounded-lg border py-2.5 font-mono text-[11px] uppercase tracking-wider ${
            role === "learner"
              ? "border-navy bg-navy text-parchment"
              : "border-line bg-white text-ink/60"
          }`}
        >
          I'm a learner
        </button>
        <button
          type="button"
          onClick={() => setRole("curator")}
          className={`rounded-lg border py-2.5 font-mono text-[11px] uppercase tracking-wider ${
            role === "curator"
              ? "border-navy bg-navy text-parchment"
              : "border-line bg-white text-ink/60"
          }`}
        >
          I'm a curator
        </button>
      </div>

      <form onSubmit={handleSubmit} className="mt-4 space-y-3">
        <div>
          <label className="font-mono text-[11px] uppercase tracking-wider text-ink/50">
            Full name
          </label>
          <input
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="mt-1 w-full rounded-lg border border-line bg-white px-3 py-2.5 text-sm outline-none focus:border-brass"
            placeholder="Ada Lovelace"
          />
        </div>
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
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-lg border border-line bg-white px-3 py-2.5 text-sm outline-none focus:border-brass"
            placeholder="At least 6 characters"
          />
        </div>

        {error && <p className="text-sm text-stamp">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-brass py-2.5 font-mono text-[12px] uppercase tracking-wider text-navy disabled:opacity-50"
        >
          {loading ? "Creating account…" : "Create account"}
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-ink/60">
        Already have an account?{" "}
        <Link href="/login" className="text-brass-dark underline">
          Sign in
        </Link>
      </p>
    </>
  );
}

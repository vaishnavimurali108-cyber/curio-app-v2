"use client";

import Link from "next/link";
import { useAuth } from "@/context/auth-context";

export function TopBar({ title }: { title?: string }) {
  const { user, profile, signOut } = useAuth();

  return (
    <header className="sticky top-0 z-30 border-b border-line/70 bg-parchment/95 px-4 py-3 backdrop-blur">
      <div className="mx-auto flex max-w-md items-center justify-between">
        <Link href="/" className="font-display text-2xl tracking-tight text-navy">
          Curio{title ? <span className="text-ink/40"> / {title}</span> : null}
        </Link>
        {user ? (
          <button
            onClick={() => signOut()}
            className="font-mono text-[11px] uppercase tracking-wider text-ink/50"
          >
            {profile?.role === "curator" ? "Curator" : "Learner"} · Sign out
          </button>
        ) : (
          <Link
            href="/login"
            className="font-mono text-[11px] uppercase tracking-wider text-brass-dark"
          >
            Sign in
          </Link>
        )}
      </div>
    </header>
  );
}

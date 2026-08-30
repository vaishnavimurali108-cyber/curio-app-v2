"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, Ticket, Sparkles, LayoutDashboard } from "lucide-react";
import { useAuth } from "@/context/auth-context";

export function BottomNav() {
  const pathname = usePathname();
  const { profile } = useAuth();

  const items = [
    { href: "/", label: "Discover", icon: Compass },
    { href: "/concierge", label: "Concierge", icon: Sparkles },
    { href: "/bookings", label: "My Tickets", icon: Ticket },
    ...(profile?.role === "curator"
      ? [{ href: "/dashboard", label: "Curate", icon: LayoutDashboard }]
      : []),
  ];

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-parchment/95 backdrop-blur"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="mx-auto flex max-w-md items-stretch justify-around">
        {items.map(({ href, label, icon: Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                className="flex flex-col items-center gap-1 py-2.5 text-[11px]"
              >
                <Icon
                  size={20}
                  strokeWidth={active ? 2.4 : 1.8}
                  className={`transition-transform duration-200 ${
                    active ? "scale-110 text-brass-dark" : "text-ink/40"
                  }`}
                />
                <span
                  className={
                    active ? "font-medium text-ink" : "text-ink/40"
                  }
                >
                  {label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

# Curio

Curated experiential learning — museum tours, lecdems, walking tours, and
exclusive small-group roundtables with subject-matter experts. Built as a
mobile-first web app.

**Problem it solves:** people who want to learn things beyond a course or a
YouTube video — who want to actually go somewhere and do something — don't
have one place that surfaces good, vetted, niche experiences. Generic event
platforms (Luma, District, Eventbrite) are neutral ticketing rails; Curio
curates, and adds an AI concierge that recommends based on intent rather than
category filters.

## What's implemented

| Requirement | Where |
|---|---|
| Auth (sign up / login / logout) | Supabase Auth, `/signup`, `/login`, sign-out in top bar |
| CRUD on core entity (Experiences) | `/dashboard` (curator role) — create, read, update, delete |
| Core business flow | Browse (`/`) → Experience detail (`/experiences/[id]`) → Reserve/checkout → Confirmation → `/bookings` |
| Differentiator | `/concierge` — AI recommendation chat, backed by Claude API + live experience data |

Two roles: **learner** (browses, books) and **curator** (also gets a CRUD
dashboard for hosting experiences). Chosen at sign-up.

## Stack

- Next.js 16 (App Router) + TypeScript + Tailwind CSS v4
- Supabase — Postgres + Auth + Row Level Security
- Claude API (`@anthropic-ai/sdk`) — powers the concierge
- Deployed on Vercel

## Setup (local + deploy)

### 1. Supabase project
1. Create a free project at [supabase.com](https://supabase.com).
2. In **SQL Editor**, run `supabase/schema.sql` (tables, RLS policies, triggers).
3. In **Project Settings > API**, copy the Project URL and `anon public` key.
4. In **Authentication > Providers > Email**, you can turn **off** "Confirm
   email" while testing, so sign-up logs you straight in — helpful for demo
   speed and for whoever's reviewing your submission.

### 2. Environment variables
Copy `.env.local.example` to `.env.local` and fill in:
```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
ANTHROPIC_API_KEY=...
```

### 3. Run locally
```
npm install
npm run dev
```

### 4. Seed demo data
1. Sign up once through the app itself as a curator (e.g.
   `curator@curio.test`) — this creates the profile row automatically.
2. In Supabase **Authentication > Users**, copy that user's UUID.
3. Open `supabase/seed.sql`, replace the placeholder UUID, and run it in the
   SQL Editor. This gives you 5 sample experiences to demo against.
4. Sign up a second account as a learner to test the booking flow end-to-end.

### 5. Deploy
1. Push this repo to GitHub.
2. Import it into [Vercel](https://vercel.com), add the same three env vars
   in Project Settings > Environment Variables.
3. Deploy. Update Supabase **Authentication > URL Configuration** with your
   Vercel domain if you turn email confirmation back on.

## Notes / known limitations

- Checkout is a prototype confirmation step — no real payment gateway is
  wired in (would plug in Razorpay/Stripe next).
- The concierge model string in `src/app/api/concierge/route.ts` may need
  updating to whatever the current Claude model is at
  [docs.claude.com](https://docs.claude.com/en/docs/about-claude/models).
- `middleware.ts` shows a deprecation notice in Next.js 16 (renamed to
  `proxy.ts`) — it still works, just a naming change upstream.

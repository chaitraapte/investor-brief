# Investor Brief v2

A multi-session, multi-user evolution of the original Investor Brief tool. Adds two things
the stateless v1 app deliberately leaves out: a searchable history of every brief you've
generated, and a WhatsApp share link for sending a brief to someone else.

Sign in with your email (a magic link, no password) to use it. Each brief is still generated
the same way as v1 — live Tavily search plus a Gemini Flash synthesis call with the same
anti-hallucination grounding rules — but now persists to your account instead of disappearing
when you close the tab.

## Setup

```bash
npm install
cp .env.local.example .env.local
```

Fill in `.env.local`:

- `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` — from your Supabase project's
  Settings → API
- `GEMINI_API_KEY`, `TAVILY_API_KEY`, `SERPER_API_KEY` — same as v1

Email sign-in works out of the box with Supabase's built-in email provider — no external
OAuth app or API key needed.

Then:

```bash
npm run dev
```

## Architecture

- `app/page.tsx` + `components/Dashboard.tsx` — signed-in home: the generate form and the
  progress/results flow
- `app/history/page.tsx` — list of every brief the signed-in user has generated
- `app/brief/[id]/page.tsx` — reopen a past brief (owner view, with a WhatsApp share button)
- `app/share/[slug]/page.tsx` — public, read-only view of a shared brief, no login required
- `app/api/brief/route.ts` — same live search + Gemini pipeline as v1, now behind auth and
  persisting each result to the `briefs` table
- `components/AuthButton.tsx` — email magic-link sign-in and sign-out
- `lib/supabase/` — server/browser/middleware Supabase clients (the standard `@supabase/ssr`
  pattern)
- `briefs` table — one row per generated brief, with row-level security so each user only
  sees their own, plus a public-read policy for rows with `is_shared = true`

## Notes

- The original v1 app (`investor-brief`) is untouched and still spec-compliant (stateless,
  no accounts, no database) — this is a separate exploration, not a replacement.
- No calendar integration — that was explored (Calendly, then Google Calendar) and removed
  to keep sign-in simple and dependency-free.
